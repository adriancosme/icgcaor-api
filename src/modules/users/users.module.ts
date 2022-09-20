import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { IsEmailAlreadyExistConstraint, IsUsernameAlreadyExistConstraint } from '../../common/validators';

import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './services';
import { UsersController } from './users.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UsersService, IsEmailAlreadyExistConstraint, IsUsernameAlreadyExistConstraint],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
