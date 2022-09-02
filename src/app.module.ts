import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  controllers: [AppController],
  imports: [CoreModule, AuthModule, UsersModule],
})
export class AppModule {}
