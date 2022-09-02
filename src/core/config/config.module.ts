import { Module } from '@nestjs/common';
import { ConfigModule as ConfigModulePackage } from '@nestjs/config';

import serverConfig from '../../config/server.config';
import configSchema from '../../config/config.schema';
import databaseConfig from '../../config/database.config';
@Module({
  imports: [
    ConfigModulePackage.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'production' ? true : false,
      envFilePath: `environment/.env.${process.env.NODE_ENV || 'development'}`,
      load: [serverConfig, databaseConfig],
      validationSchema: configSchema,
      isGlobal: true,
    }),
  ],
})
export class ConfigModule {}
