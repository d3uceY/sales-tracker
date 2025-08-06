import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Returns a greeting message to confirm the API is running',
    schema: {
      type: 'string',
      example: 'Welcome to Transaction Tracker API!',
    },
  })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
