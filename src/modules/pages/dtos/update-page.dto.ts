import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, Matches } from 'class-validator';

export class UpdatePageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  _id: string;
  @ApiProperty()
  @IsUrl()
  @IsNotEmpty()
  @Matches('indar.mx|surtimex.com')
  url: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  provider: string;
}
