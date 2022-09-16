import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl, Contains } from 'class-validator';

export class UpdatePageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  _id: string;
  @ApiProperty()
  @IsUrl()
  @IsNotEmpty()
  @Contains('indar.mx')
  url: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
