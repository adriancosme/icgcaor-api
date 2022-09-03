import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { IsEmailAlreadyExist, IsUsernameAlreadyExist } from '../../../common/validators';
import { PATTERN_VALID_USERNAME } from '../../../config/config.constants';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email for your account, must be unique.',
  })
  @IsEmailAlreadyExist({
    message: 'Email $value already exists. Choose another Email.',
  })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'Secure password' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
