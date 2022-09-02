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

  @ApiProperty({
    description: 'Username for your account, must be unique.',
  })
  @IsUsernameAlreadyExist({
    message: 'Username $value already exists. Choose another username.',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(PATTERN_VALID_USERNAME, {
    message: `Username $value don't have a valid format`,
  })
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ description: 'Secure password' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
