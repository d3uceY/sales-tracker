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
  Response,
  Res,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import { TransactionWithCustomerDto } from './dto/transaction-with-customer.dto';
import { TransactionWithVendorDto } from './dto/transaction-with-vendor.dto';
import { CreateCustomerTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiOkResponse } from '@nestjs/swagger';
import { Response as ExpressResponse } from 'express';

@ApiTags('transactions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @ApiOperation({ summary: 'List transactions for a customer (with filters, pagination)' })
  @ApiParam({ name: 'customerId', required: true })
  @ApiQuery({ name: 'paymentStatus', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({
    status: 200,
    description: 'List of transactions for a customer',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/Transaction' } },
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
  @Get('customers/:customerId/transactions')
  async listForCustomer(
    @Param('customerId') customerId: string,
    @Query() filter: TransactionFilterDto,
  ) {
    return this.transactionService.listCustomerTransactions(customerId, filter);
  }

  @ApiOperation({ summary: 'Create a transaction for a customer' })
  @ApiParam({ name: 'customerId', required: true })
  @ApiResponse({
    status: 201,
    description: 'Transaction created',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/Transaction' },
      },
    },
  })
  @Post('customers/:customerId/transactions')
  @Roles('Admin', 'Super Admin')
  async createForCustomer(
    @Param('customerId') customerId: string,
    @Body() dto: CreateCustomerTransactionDto,
  ) {
    return this.transactionService.createCustomerTransaction(customerId, dto);
  }

  @ApiOperation({ summary: 'Get all transactions with customer name' })
  @ApiOkResponse({ type: [TransactionWithCustomerDto] })
  @Get('transactions/all-with-customer')
  @Roles('Admin', 'Super Admin')
  async getAllWithCustomer() {
    return this.transactionService.getAllTransactionsWithCustomer();
  }

  @ApiOperation({ summary: 'Get all vendor transactions with vendor name' })
  @ApiOkResponse({ type: [TransactionWithVendorDto] })
  @Get('transactions/all-with-vendor')
  @Roles('Admin', 'Super Admin')
  async getAllWithVendor() {
    return this.transactionService.getAllTransactionsWithVendor();
  }

  @ApiOperation({ summary: 'Get a transaction' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({
    status: 200,
    description: 'Transaction details',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/Transaction' },
      },
    },
  })
  @Get('transactions/:id')
  async get(@Param('id') id: string) {
    return this.transactionService.getTransaction(id);
  }

  @ApiOperation({ summary: 'Update a transaction' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({
    status: 200,
    description: 'Transaction updated',
    schema: {
      type: 'object',
      properties: {
        data: { $ref: '#/components/schemas/Transaction' },
      },
    },
  })
  @Put('transactions/:id')
  @Roles('Admin', 'Super Admin')
  async update(@Param('id') id: string, @Body() dto: UpdateTransactionDto) {
    return this.transactionService.updateTransaction(id, dto);
  }

  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'Transaction deleted', schema: { type: 'object', properties: { data: { type: 'boolean', example: true } } } })
  @Delete('transactions/:id')
  @Roles('Admin', 'Super Admin')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.transactionService.deleteTransaction(id);
  }

  @ApiOperation({ summary: 'Generate/download invoice PDF for a transaction' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({ status: 200, description: 'Invoice PDF', schema: { type: 'string', format: 'binary' } })
  @Get('transactions/:id/invoice')
  async getInvoice(@Param('id') id: string, @Res() res: ExpressResponse) {
    const { pdfBuffer, filename } = await this.transactionService.generateInvoicePdf(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  }
} 