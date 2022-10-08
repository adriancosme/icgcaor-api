import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';
import { IsUsernameAlreadyExist } from '../../../common/validators';

export class CreateUserDto {
  @ApiProperty({
    description: 'Username for your account, must be unique.',
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
  @ApiProperty({ description: 'Secure password', enum: Object.values(Role) })
  @IsEnum(Role)
  role!: Role;
}
