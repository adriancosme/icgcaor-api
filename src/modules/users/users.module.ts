import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { IsEmailAlreadyExistConstraint, IsUsernameAlreadyExistConstraint } from '../../common/validators';
import { CreateAdminRunner } from './commands/create-admin.command';

import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './services';
import { UsersController } from './users.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UsersService, IsEmailAlreadyExistConstraint, IsUsernameAlreadyExistConstraint, CreateAdminRunner],
  exports: [UsersService, CreateAdminRunner],
  controllers: [UsersController],
})
export class UsersModule {}
