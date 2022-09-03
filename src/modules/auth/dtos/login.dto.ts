import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'You can use a valid email',
    example: 'foo@bar.com',
    required: true,
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Your account password',
    example: '123456',
    required: true,
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  password: string;
}
