import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('exchange-rate')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exchange-rate')
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Get()
  @ApiOperation({ summary: 'Get the singleton exchange rate' })
  @ApiResponse({
    status: 200,
    description: 'Current exchange rate',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-string' },
        buyRate: { type: 'number', example: 1650 },
        sellRate: { type: 'number', example: 1655 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  async getExchangeRate() {
    return this.exchangeRateService.getExchangeRate();
  }

  @Put()
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Create or update the singleton exchange rate' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        buyRate: { type: 'number', example: 1650 },
        sellRate: { type: 'number', example: 1655 }
      },
      required: ['buyRate', 'sellRate']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Exchange rate upserted',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-string' },
        buyRate: { type: 'number', example: 1650 },
        sellRate: { type: 'number', example: 1655 },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  async upsertExchangeRate(@Body() dto: { buyRate: number; sellRate: number }) {
    return this.exchangeRateService.upsertExchangeRate(dto);
  }
}