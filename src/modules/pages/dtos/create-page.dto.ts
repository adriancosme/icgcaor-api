import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePageDto {
  @ApiProperty({ description: 'Url of page to get products' })
  @IsString()
  @IsNotEmpty()
  url: string;
  @ApiProperty({ description: 'Name of the page' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
