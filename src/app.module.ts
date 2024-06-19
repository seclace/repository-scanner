import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { RepositoryScannerModule } from './repository-scanner/repository-scanner.module';
import { GithubApiService } from './github-api/github-api.service';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: true,
    }),
    ConfigModule.forRoot(),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dialect: 'sqlite',
        storage: config.get<string>('DB_URI'),
        autoLoadModels: true,
        synchronize: true,
      }),
    }),
    RepositoryScannerModule,
  ],
  controllers: [],
  providers: [GithubApiService],
})
export class AppModule {}
