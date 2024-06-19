import {
  Model,
  PrimaryKey,
  AutoIncrement,
  Column,
  Table,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { Field, ObjectType } from '@nestjs/graphql';

import { SourceRepository } from './source-repository.entity';

@Table
@ObjectType()
export class RepositoryWebhook extends Model {
  @PrimaryKey
  @Column
  @Field({ description: 'Webhook url' })
  url: string;

  @ForeignKey(() => SourceRepository)
  @Column
  repositoryUrl: string;

  @BelongsTo(() => SourceRepository, { foreignKey: 'repositoryUrl' })
  repository: SourceRepository;
}
