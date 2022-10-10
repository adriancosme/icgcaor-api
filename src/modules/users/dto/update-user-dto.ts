import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { IsUsernameAlreadyExist } from '../../../common/validators';
import { PATTERN_VALID_USERNAME } from '../../../config/config.constants';
import { CreateUserDto } from './create-user.dto';

// TODO: sintetizar esto porque a lo mejor los tipados estan demas
export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['username'])) {
  @ApiProperty()
  @IsOptional()
  _id?: string;

  @ApiProperty()  
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(PATTERN_VALID_USERNAME, {
    message: `Username $value don't have a valid format`,
  })
  @IsOptional()
  username: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  password: string;
}
