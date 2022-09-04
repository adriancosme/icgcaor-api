import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 49153,
        password: 'redispw',
        username: 'default',
      },
    }),
  ],
})
export class QueueModule {}
