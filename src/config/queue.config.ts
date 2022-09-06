import { BullModuleOptions } from '@nestjs/bull';
import { registerAs } from '@nestjs/config';

function bullModuleOptions(): BullModuleOptions {
  return {
    redis: {
      host: process.env.REDIS_HOST,
      port: +process.env.REDIS_PORT,
    },
  } as BullModuleOptions;
}

export default registerAs('queue', () => ({ config: bullModuleOptions }));
