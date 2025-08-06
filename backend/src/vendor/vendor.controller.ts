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
  Req,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { VendorService } from './vendor.service';
import { CreateVendorDto, UpdateVendorDto, VendorFilterDto, VendorTransactionFilterDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { UpdateTransactionDto } from '../transaction/dto/update-transaction.dto';
import { Response as ExpressResponse } from 'express';
import { CreateTransactionDto } from '../transaction/dto/create-transaction.dto';
import { TransactionFilterDto } from '../transaction/dto/transaction-filter.dto';
import { CreateVendorTransactionDto } from './dto/create-vendor-transaction.dto';

@ApiTags('vendors')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @ApiOperation({ summary: 'List vendors' })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of vendors with pagination' })
  @Get()
  async list(@Query() filter: VendorFilterDto, @Req() req) {
    return this.vendorService.listVendors(filter, req.user);
  }

  @ApiOperation({ summary: 'Create a new vendor' })
  @ApiResponse({ status: 201, description: 'Vendor created' })
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Super Admin')
  @Post()
  async create(@Body() dto: CreateVendorDto, @Req() req) {
    return this.vendorService.createVendor(dto, req.user);
  }

  @ApiOperation({ summary: 'Get vendor details' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiResponse({ status: 200, description: 'Vendor details with purchase summary' })
  @Get(':id')
  async get(@Param('id') id: string, @Req() req) {
    return this.vendorService.getVendorById(id, req.user);
  }

  @ApiOperation({ summary: 'Update vendor' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiResponse({ status: 200, description: 'Vendor updated' })
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Super Admin')
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateVendorDto, @Req() req) {
    return this.vendorService.updateVendor(id, dto, req.user);
  }

  @ApiOperation({ summary: 'Delete vendor' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiResponse({ status: 200, description: 'Vendor deleted' })
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Super Admin')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @Req() req) {
    return this.vendorService.deleteVendor(id, req.user);
  }

  @ApiOperation({ summary: 'List transactions for a vendor (with filters, pagination)' })
  @ApiParam({ name: 'vendorId', required: true })
  @ApiQuery({ name: 'paymentStatus', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({
    status: 200,
    description: 'List of transactions for a vendor',
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
  @Get(':vendorId/transactions')
  async listVendorTransactions(@Param('vendorId') vendorId: string, @Query() filter: TransactionFilterDto, @Req() req) {
    return this.vendorService.listVendorTransactions(vendorId, filter, req.user);
  }

  @ApiOperation({ summary: 'Create a transaction for a vendor' })
  @ApiParam({ name: 'vendorId', required: true })
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
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Super Admin')
  @Post(':vendorId/transactions')
  async createVendorTransaction(@Param('vendorId') vendorId: string, @Body() dto: CreateVendorTransactionDto, @Req() req) {
    return this.vendorService.createVendorTransaction(vendorId, dto, req.user);
  }

  @ApiOperation({ summary: 'Get a vendor transaction' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Vendor transaction details' })
  @Get('/transactions/:id')
  async getVendorTransaction(@Param('id') id: string, @Req() req) {
    return this.vendorService.getVendorTransaction(id, req.user);
  }

  @ApiOperation({ summary: 'Update a vendor transaction' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Vendor transaction updated' })
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Super Admin')
  @Put('/transactions/:id')
  async updateVendorTransaction(@Param('id') id: string, @Body() dto: UpdateTransactionDto, @Req() req) {
    return this.vendorService.updateVendorTransaction(id, dto, req.user);
  }

  @ApiOperation({ summary: 'Delete a vendor transaction' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Vendor transaction deleted' })
  @UseGuards(RolesGuard)
  @Roles('Admin', 'Super Admin')
  @Delete('/transactions/:id')
  @HttpCode(HttpStatus.OK)
  async deleteVendorTransaction(@Param('id') id: string, @Req() req) {
    return this.vendorService.deleteVendorTransaction(id, req.user);
  }

  @ApiOperation({ summary: 'Generate/download invoice PDF for a vendor transaction' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({ status: 200, description: 'Invoice PDF', schema: { type: 'string', format: 'binary' } })
  @Get('/transactions/:id/invoice')
  async getVendorInvoice(@Param('id') id: string, @Req() req, @Res() res: ExpressResponse) {
    const { pdfBuffer, filename } = await this.vendorService.generateVendorInvoicePdf(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  }
} 