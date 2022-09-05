import { BullModuleOptions } from '@nestjs/bull';
import { registerAs } from '@nestjs/config';

function bullModuleOptions(): BullModuleOptions {
  return {
    redis: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      username: process.env.REDIS_USER,
      password: process.env.REDIS_PASS,
    },
  };
}

export default registerAs('queue', () => ({ config: bullModuleOptions }));
