import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Contains, IsUrl, Matches } from 'class-validator';

export class CreatePageDto {
  @ApiProperty({ description: 'Url of page to get products' })
  @IsUrl()
  @IsNotEmpty()
  @Matches('indar.mx|surtimex.com')
  url: string;
  @ApiProperty({ description: 'Name of the page' })
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty({ description: 'Provider of products' })
  @IsString()
  @IsNotEmpty()
  provider: string;
}
