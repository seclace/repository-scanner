import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Table,
  Column,
  PrimaryKey,
  Model,
  HasMany,
  AllowNull,
} from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import * as moment from 'moment/moment';

import { RepositoryWebhook } from './repository-webhook.entity';

@Table
@ObjectType()
export class SourceRepository extends Model {
  @PrimaryKey
  @Column
  @Field({
    description: 'Repository id, i.e. github.com/<username>/<reposiroty_name>',
    nullable: false,
  })
  url: string;

  @Column
  @Field({ description: 'Repository name' })
  name: string;

  @Column
  @Field(() => Int, { description: 'Repository size' })
  size: number;

  @Column
  @Field({ description: 'Repository owner' })
  owner: string;

  @Column
  @Field({ description: 'Repository visibility (private or public)' })
  isPrivate: boolean;

  @Column
  @Field(() => Int, { description: 'Repository files count' })
  filesCount: number;

  @AllowNull
  @Column(DataTypes.TEXT)
  @Field({ description: 'Repository first yaml contents', nullable: true })
  firstYamlContent: string;

  @HasMany(() => RepositoryWebhook)
  @Field(() => [RepositoryWebhook], {
    description: 'Repository last yaml contents',
    nullable: true,
  })
  activeWebhooks: RepositoryWebhook[];

  @Column
  cacheExpiresAt: Date;

  isCacheExpired(): boolean {
    return moment().utc().isSameOrAfter(this.cacheExpiresAt);
  }
}

@ObjectType()
export class SourceRepositoryListItem {
  @Field({
    description: 'Repository url, i.e. github.com/<username>/<reposiroty_name>',
    nullable: false,
  })
  url: string;

  @Field({ description: 'Repository name' })
  name: string;

  @Field(() => Int, { description: 'Repository size' })
  size: number;

  @Field({ description: 'Repository owner' })
  owner: string;
}
