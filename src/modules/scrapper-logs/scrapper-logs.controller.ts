import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiUnauthorizedResponse, ApiBadGatewayResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ScrapperLogsService } from './services/scrapper-logs.service';

@UseGuards(JwtAuthGuard)
@Controller('scrapper')
export class ScrapperLogsController {
  constructor(public service: ScrapperLogsService) {}

  /**
   * Get last log of scrapper
   */
  @ApiTags('Logger scrapper single operation')
  @ApiOperation({ summary: 'Get lastest update log', description: 'Get latest log' })
  @ApiOkResponse({ status: 200, description: 'Success response' })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @ApiBadGatewayResponse({ status: 502, description: 'Something happened' })
  @ApiBadRequestResponse({ status: 400, description: 'You will prompt with an array with the validation issues' })
  @Get('/')
  async getLastUpdate() {
    return await this.service.getLastUpdate();
  }
}
