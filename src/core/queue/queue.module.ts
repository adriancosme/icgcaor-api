import { BullModule, BullModuleOptions } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CONFIG_QUEUE_CONFIG } from 'src/config/config.constants';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => configService.get<BullModuleOptions>(CONFIG_QUEUE_CONFIG),
      inject: [ConfigService],
    }),
  ],
})
export class QueueModule {}
