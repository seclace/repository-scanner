import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import * as moment from 'moment';

import { REPOSITORIES } from './repository-scanner.constants';
import { SourceRepository } from './entities/source-repository.entity';
import { GithubApiService } from '../github-api/github-api.service';
import { RepositoryWebhook } from './entities/repository-webhook.entity';

@Injectable()
export class RepositoryScannerService {
  constructor(
    @InjectModel(SourceRepository)
    private readonly sourceRepositoryDao: typeof SourceRepository,
    @InjectModel(RepositoryWebhook)
    private readonly repositoryWebhookDao: typeof RepositoryWebhook,
    private readonly githubApi: GithubApiService,
    private readonly configService: ConfigService,
  ) {}

  private async scanRepository(url: string): Promise<SourceRepository> {
    const repoInfo = await this.githubApi.fetchRepositoryInfo(url);
    const expirationTimeout = Number(
      this.configService.get<string>('REPO_CACHE_EXPIRATION_TIMEOUT'),
    );
    let [sourceRepo] = await this.sourceRepositoryDao.upsert({
      url: url,
      name: repoInfo.name,
      size: repoInfo.size,
      owner: repoInfo.owner.login,
      isPrivate: repoInfo.private,
      filesCount: repoInfo.filesCount,
      firstYamlContent: repoInfo.firstYamlContent,
      cacheExpiresAt: moment()
        .utc()
        .add(expirationTimeout, 'milliseconds')
        .format(),
    });
    await sourceRepo.save();

    const webhooksData = await this.githubApi.fetchWebhooks(url);
    for (const webhook of webhooksData) {
      const [webhookEntity] = await this.repositoryWebhookDao.findOrCreate({
        where: {
          url: webhook.url,
        },
        defaults: {
          url: webhook.url,
          repositoryUrl: sourceRepo.url,
        },
      });
      await webhookEntity.save();
    }

    sourceRepo = await this.sourceRepositoryDao.findByPk(url, {
      include: [RepositoryWebhook],
    });
    return sourceRepo;
  }

  async scanAll(): Promise<void> {
    const simultaneousScans = Number(
      this.configService.get<string>('SIMULTANEOUS_SCANS'),
    );

    const repositories = [...REPOSITORIES];
    const repositoryGroups = [];
    while (repositories.length > 0) {
      const nextGroup = repositories.splice(0, simultaneousScans);
      repositoryGroups.push(nextGroup);
    }

    for (const group of repositoryGroups) {
      await Promise.all(group.map(this.scanRepoIfNotFoundOrExpired));
    }
  }

  scanRepoIfNotFoundOrExpired = async (
    url: string,
  ): Promise<SourceRepository> => {
    let sourceRepo = await this.sourceRepositoryDao.findByPk(url, {
      include: [RepositoryWebhook],
    });

    if (!sourceRepo || sourceRepo?.isCacheExpired()) {
      sourceRepo = await this.scanRepository(url);
    }

    return sourceRepo;
  };
}
