import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { IsUsernameAlreadyExist } from '../../../common/validators';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email for your account, must be unique.',
  })
  @IsUsernameAlreadyExist({
    message: 'Username $value already exists. Choose another username.',
  })  
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  username!: string;

  @ApiProperty({ description: 'Secure password' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
