import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Contains, IsUrl } from 'class-validator';

export class CreatePageDto {
  @ApiProperty({ description: 'Url of page to get products' })
  @IsUrl()
  @IsNotEmpty()
  @Contains('www.indar.mx')
  url: string;
  @ApiProperty({ description: 'Name of the page' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
