import { Args, Query, Resolver } from '@nestjs/graphql';

import { RepositoryScannerService } from './repository-scanner.service';
import { SourceRepository, SourceRepositoryListItem } from './entities/source-repository.entity';
import { SourceRepositoryService } from './source-repository.service';

@Resolver(() => SourceRepository)
export class SourceRepositoryResolver {
  constructor(
    private readonly repositoryScannerService: RepositoryScannerService,
    private readonly sourceRepositoryService: SourceRepositoryService,
  ) {}

  @Query(() => [SourceRepositoryListItem], { name: 'repositories' })
  async findAll(): Promise<SourceRepositoryListItem[]> {
    await this.repositoryScannerService.scanAll();
    return this.sourceRepositoryService.findAll();
  }

  @Query(() => SourceRepository, { name: 'repository' })
  async findOne(
    @Args('url', { type: () => String }) url: string,
  ): Promise<SourceRepository> {
    return this.repositoryScannerService.scanRepoIfNotFoundOrExpired(url);
  }
}
