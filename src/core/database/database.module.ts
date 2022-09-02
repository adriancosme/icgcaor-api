import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseOptions } from 'mongoose';

import { CONFIG_DB_CONFIG } from '../../config/config.constants';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => configService.get<MongooseOptions>(CONFIG_DB_CONFIG),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
