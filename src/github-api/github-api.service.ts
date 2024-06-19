import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';

import { GithubUrlParser } from './utils/github-url-parser.util';
import { GithubWebhookResponseDto } from './dto/github-webhook-response.dto';
import { GithubRepositoryResponseDto } from './dto/github-repository-response.dto';

@Injectable()
export class GithubApiService {
  private readonly githubClient: Octokit;

  constructor(configService: ConfigService) {
    const token = configService.get<string>('GITHUB_TOKEN');
    this.githubClient = new Octokit({ auth: token });
  }

  async fetchRepositoryInfo(url: string): Promise<GithubRepositoryResponseDto> {
    const params = this.getRequestParams(url);
    const { owner, repo } = params;
    const requestUrl = `GET /repos/${owner}/${repo}`;
    const { data: repoData } = await this.githubClient.request(
      requestUrl,
      params,
    );
    // console.log('------------------------repoData:', repoData);
    const treeRequestUrl = `${requestUrl}/git/trees/main`;
    const { data: treeData } = await this.githubClient.request(treeRequestUrl, {
      ...params,
      tree_sha: 'main',
    });
    // console.log('------------------------treeData:', treeData);
    let firstYamlPath = null;
    const filesCount = treeData.tree.reduce((acc, { type, path }) => {
      if (type === 'blob') {
        acc++;

        const isYamlFile = path.endsWith('.yaml') || path.endsWith('.yml');
        if (isYamlFile && !firstYamlPath) {
          firstYamlPath = path;
        }
      }
      return acc;
    }, 0);

    // fetch repo first yaml contents
    const firstYamlContent = await this.fetchFirstYamlContent(
      url,
      firstYamlPath,
    );

    return { ...repoData, filesCount, firstYamlContent };
  }

  private async fetchFirstYamlContent(
    repoUrl: string,
    filePath: string,
  ): Promise<string> {
    if (!filePath) {
      return null;
    }
    const params = this.getRequestParams(repoUrl);
    const { owner, repo } = params;
    const requestUrl = `GET /repos/${owner}/${repo}/contents/${filePath}`;
    const { data } = await this.githubClient.request(requestUrl, {
      ...params,
      path: filePath,
    });
    return data?.content ? atob(data.content) : null;
  }

  private getRequestParams(url: string) {
    const [owner, repo] = GithubUrlParser.parse(url);

    return {
      owner,
      repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    };
  }

  async fetchWebhooks(url: string): Promise<GithubWebhookResponseDto[]> {
    const params = this.getRequestParams(url);
    const { owner, repo } = params;
    const requestUrl = `GET /repos/${owner}/${repo}/hooks`;
    const { data } = await this.githubClient.request(requestUrl, params);
    return data?.filter((w: GithubWebhookResponseDto) => w.active);
  }
}
