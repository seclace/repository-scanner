import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import { RepositoryScannerService } from './repository-scanner.service';
import { SourceRepositoryResolver } from './source-repository.resolver';
import { SourceRepositoryService } from './source-repository.service';
import { SourceRepository } from './entities/source-repository.entity';
import { RepositoryWebhook } from './entities/repository-webhook.entity';
import { GithubApiService } from '../github-api/github-api.service';

@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forFeature([SourceRepository, RepositoryWebhook]),
  ],
  providers: [
    SourceRepositoryResolver,
    SourceRepositoryService,
    RepositoryScannerService,
    GithubApiService,
  ],
})
export class RepositoryScannerModule {}
