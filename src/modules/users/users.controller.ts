import { Body, Controller, Delete, Get, Param, ParseArrayPipe, Patch, Post, Put, Query, SetMetadata, UseGuards } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';

import { DataOutput, IUser } from '../../common/interfaces';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateUserDto, UpdateUserDto } from './dto';
import { User } from './schemas/user.schema';
import { UsersService } from './services';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(public service: UsersService) { }


  /**
   * Get all users from database - ONLY FOR ADMINS
   * @example GET /users
   */
  @ApiTags('Users single operation')
  @ApiOperation({ summary: 'Get users', description: 'Get list of users' })
  @ApiOkResponse({ status: 200, description: 'Success response', type: [User] })
  @ApiOkResponse({ status: 200, description: 'Success response' })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @ApiBadGatewayResponse({ status: 502, description: 'Something happened' })
  @ApiBadRequestResponse({ status: 400, description: 'You will prompt with an array with the validation issues' })
  @Roles(Role.ADMIN)
  @Get('/')
  async getUsers() {
    return await this.service.getAll();
  }

  /**
   * Create Users - Batch
   * @param dto User Form but in Array format
   * @example POST /users/bulk
   */
  @ApiTags('Users batch operations')
  @ApiOperation({ summary: 'Create Users - Batch', description: 'Register users in batch.' })
  @ApiCreatedResponse({ status: 201, description: 'Users created successfully', type: User })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @ApiBadGatewayResponse({ status: 502, description: 'Something happened' })
  @ApiBadRequestResponse({ status: 400, description: 'You will prompt with an array with the validation issues' })
  @ApiBody({ type: [CreateUserDto] })
  @Roles(Role.ADMIN)
  @Post('bulk')
  async createBulk(@Body(new ParseArrayPipe({ items: CreateUserDto })) dto: CreateUserDto[]): Promise<DataOutput<IUser[]>> {
    return { message: 'Users created successfully', output: await this.service.createBatch(dto) };
  }

  /**
   * Get users by ids - Batch
   * @param ids User ID integer Array
   * @example GET /users/bulk?ids=1,2,3
   */
  @ApiTags('Users batch operations')
  @ApiOperation({
    summary: 'Get Users by ids- Batch',
    description: 'Get users by Ids. You will have to provide a query param of ids separated by comas example: ?ids=1,2,3',
  })
  @ApiOkResponse({ status: 200, description: 'Success response', type: [User] })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @ApiBadGatewayResponse({ status: 502, description: 'Something happened' })
  @ApiQuery({ name: 'ids', required: true, type: 'string', example: '1,2,3' })
  @Get('bulk')
  async getByIds(@Query('ids', new ParseArrayPipe({ items: Number, separator: ',' })) ids: number[]) {
    return await this.service.getByIds(ids);
  }

  /**
   * Update many
   * @param dtos Update User Form including the ID insude
   * @example PUT /users/bulk
   */
  @ApiTags('Users batch operations')
  @ApiOperation({ summary: 'Update users - Batch', description: 'Update users. You have to provide an id each object inside an updateUserDTO' })
  @ApiOkResponse({ status: 200, description: 'Success response' })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @ApiBadGatewayResponse({ status: 502, description: 'Something happened' })
  @ApiBadRequestResponse({ status: 400, description: 'You will prompt with an array with the validation issues' })
  @ApiBody({ required: true, type: [UpdateUserDto] })
  @Roles(Role.ADMIN)
  @Put('bulk')
  async updateMany(@Body(new ParseArrayPipe({ items: UpdateUserDto })) dtos: UpdateUserDto[]) {
    return await this.service.updateMany(dtos);
  }

  /**
   * Disable users
   * @param ids User ID integers ?ids=1,2,3
   * @example DELETE /users/bulk/disable?ids=1,2,3
   */
  @ApiTags('Users batch operations')
  @ApiOperation({
    summary: 'Disable users - Batch',
    description: 'Disable users. You will have to provide a query param of ids separated by comas example: ?ids=1,2,3',
  })
  @ApiOkResponse({ status: 200, description: 'Success response' })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @ApiBadGatewayResponse({ status: 502, description: 'Something happened' })
  @ApiQuery({ name: 'ids', required: true, type: 'string', example: '1,2,3' })
  @Roles(Role.ADMIN)
  @Patch('bulk/disable')
  async disableMany(@Query('ids', new ParseArrayPipe({ items: Number, separator: ',' })) ids: number[]) {
    return await this.service.disableMany(ids);
  }

  /**
   * Enable users
   * @param ids User ID integers ?ids=1,2,3
   * @example DELETE /users/bulk/enable?ids=1,2,3
   */
  @ApiTags('Users batch operations')
  @ApiOperation({
    summary: 'Enable users - Batch',
    description: 'Enable users. You will have to provide a query param of ids separated by comas example: ?ids=1,2,3',
  })
  @ApiOkResponse({ status: 200, description: 'Success response' })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @ApiBadGatewayResponse({ status: 502, description: 'Something happened' })
  @ApiQuery({ name: 'ids', required: true, type: 'string', example: '1,2,3' })
  @Roles(Role.ADMIN)
  @Patch('bulk/enable')
  async enableMany(@Query('ids', new ParseArrayPipe({ items: Number, separator: ',' })) ids: number[]) {
    return await this.service.enableMany(ids);
  }

  /**
   * Create User  - Single
   * @param dto User Form
   * @example POST /users
   */
  @ApiTags('Users single operation')
  @ApiOperation({ summary: 'Create User  - Single', description: 'Register an user, this can be public or privated.' })
  @ApiCreatedResponse({ status: 201, description: 'User created successfully', type: User })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @ApiBadGatewayResponse({ status: 502, description: 'Something happened' })
  @ApiBadRequestResponse({ status: 400, description: 'You will prompt with the validation issues' })
  @ApiBody({ type: CreateUserDto })
  @Roles(Role.ADMIN)
  @Post()
  async createOne(@Body() dto: CreateUserDto): Promise<DataOutput<User>> {
    return { message: 'User created successfully', output: await this.service.create(dto) };
  }

  /**
   * Update one - Single
   * @param dto Update User Form
   * @example PUT /users
   */
  @ApiTags('Users single operation')
  @ApiOperation({ summary: 'Update user - Single', description: 'Update user by Id. You have to provide an id in the body' })
  @ApiOkResponse({ status: 200, description: 'Success response' })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @ApiBadGatewayResponse({ status: 502, description: 'Something happened' })
  @ApiBadRequestResponse({ status: 400, description: 'You will prompt with an array with the validation issues' })
  @ApiBody({ required: true, type: UpdateUserDto })
  @Roles(Role.ADMIN)
  @Put()
  async updateOne(@Body() dto: UpdateUserDto) {    
    return await this.service.update(dto);
  }

  /**
   * Delete one (ATENTTION: PERMANENT DELETION)
   * @param id User ID integer
   */
  @ApiTags('Users single operation')
  @ApiOperation({
    summary: 'Hard delete  user - Batch',
    description: '(HARD DELETION) Delete user. You will have to provide a query param of ids separated by comas example: ?ids=1,2,3',
  })
  @ApiOkResponse({ status: 200, description: 'Success response' })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @ApiBadGatewayResponse({ status: 502, description: 'Something happened' })
  @ApiParam({ name: 'id', required: true, type: 'number', example: '1' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }

  /**
   * Disable user
   * @param ids User ID integer
   * @example DELETE /users/1/disable
   */
  @ApiTags('Users single operation')
  @ApiOperation({
    summary: 'Disable user - single',
    description: 'Disable user. You will have to provide a query param of ids separated by comas example: ?ids=1,2,3',
  })
  @ApiOkResponse({ status: 200, description: 'Success response' })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @ApiBadGatewayResponse({ status: 502, description: 'Something happened' })
  @ApiParam({ name: 'id', required: true, type: 'number', example: '1' })
  @Patch(':id/disable')
  async disable(@Param('id') id: string) {
    return await this.service.disable(id);
  }

  /**
   * Enable one user
   * @param ids User ID integer
   * @example DELETE /users/1/enable
   */
  @ApiTags('Users single operation')
  @ApiOperation({
    summary: 'Enable user - Batch',
    description: 'Enable user. You will have to provide a query param of ids separated by comas example: ?ids=1,2,3',
  })
  @ApiOkResponse({ status: 200, description: 'Success response' })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @ApiBadGatewayResponse({ status: 502, description: 'Something happened' })
  @ApiParam({ name: 'id', required: true, type: 'number', example: '1' })
  @Patch(':id/enable')
  async enable(@Param('id') id: number) {
    return await this.service.enable(id);
  }
}
