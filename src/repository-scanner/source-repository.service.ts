import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { SourceRepository } from './entities/source-repository.entity';
import { RepositoryWebhook } from './entities/repository-webhook.entity';

@Injectable()
export class SourceRepositoryService {
  constructor(
    @InjectModel(SourceRepository)
    private readonly sourceRepositoryDao: typeof SourceRepository,
  ) {}

  async findAll(): Promise<SourceRepository[]> {
    return this.sourceRepositoryDao.findAll();
  }

  async findOne(id: string): Promise<SourceRepository> {
    return this.sourceRepositoryDao.findByPk(id, {
      include: [RepositoryWebhook],
    });
  }
}
