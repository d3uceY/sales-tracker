import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerFilterDto } from './dto/customer-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('customers')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiOperation({ summary: 'List customers with search, filter, and pagination' })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({
    status: 200,
    description: 'List of customers',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/Customer' } },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 100 },
          },
        },
      },
    },
  })
  @Get()
  async list(@Query() filter: CustomerFilterDto) {
    return this.customerService.listCustomers(filter);
  }

  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({
    status: 201,
    description: 'Customer created',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/Customer' },
      },
    },
  })
  @Post()
  @Roles('Admin', 'Super Admin')
  async create(@Body() dto: CreateCustomerDto) {
    return this.customerService.createCustomer(dto);
  }

  @ApiOperation({ summary: 'Get customer details with balance and transactions' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({
    status: 200,
    description: 'Customer details',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            status: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            balance: { type: 'number', example: 1000 },
            transactions: {
              type: 'array',
              items: { $ref: '#/components/schemas/Transaction' },
            },
          },
        },
      },
    },
  })
  @Get(':id')
  async get(@Param('id') id: string) {
    return this.customerService.getCustomerDetails(id);
  }

  @ApiOperation({ summary: 'Update a customer' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({
    status: 200,
    description: 'Customer updated',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/Customer' },
      },
    },
  })
  @Put(':id')
  @Roles('Admin', 'Super Admin')
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customerService.updateCustomer(id, dto);
  }

  @ApiOperation({ summary: 'Delete a customer' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'Customer deleted', schema: { type: 'object', properties: { data: { type: 'boolean', example: true } } } })
  @Delete(':id')
  @Roles('Admin', 'Super Admin')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.customerService.deleteCustomer(id);
  }

  @ApiOperation({ summary: 'Get customer last transaction outstanding balance by name' })
  @ApiQuery({ name: 'name', required: true, description: 'Customer name' })
  @ApiResponse({
    status: 200,
    description: 'Customer last transaction outstanding balance',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            customerName: { type: 'string', example: 'John Doe' },
            lastTransactionId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            lastTransactionDate: { type: 'string', format: 'date-time', example: '2024-01-01T00:00:00.000Z' },
            outstandingBalance: { type: 'number', example: 50000 },
            paymentStatus: { type: 'string', example: 'paid', enum: ['paid', 'partial', 'unpaid', 'overdue'] },
            hasTransactions: { type: 'boolean', example: true }
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found',
  })
  @Get('balance/by-name')
  async getCustomerBalanceByName(@Query('name') name: string) {
    return this.customerService.getCustomerBalanceByName(name);
  }
} 