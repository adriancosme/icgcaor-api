import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { DatabaseModule } from './database/database.module';
import { QueueModule } from './queue/queue.module';

const CORE_MODULES = [DatabaseModule, ConfigModule, SchedulerModule, QueueModule];

@Module({
  imports: CORE_MODULES,
  exports: CORE_MODULES,
})
export class CoreModule {}
