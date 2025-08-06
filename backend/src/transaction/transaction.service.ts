import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from '@prisma/client';
import { TransactionFilterDto } from './dto/transaction-filter.dto';
import { BadRequestException } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { CreateCustomerTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  // Utility to normalize date input
  private normalizeDate(input: any): Date {
    if (!input) throw new BadRequestException('Transaction date is required');
    if (input instanceof Date) return input;
    if (typeof input === 'number') {
      const date = new Date(input);
      if (!isNaN(date.getTime())) return date;
    }
    if (typeof input === 'string') {
      let date = new Date(input);
      if (!isNaN(date.getTime())) return date;
      // Try parsing as YYYY-MM-DD manually
      const match = input.match(/^\d{4}-\d{2}-\d{2}$/);
      if (match) {
        date = new Date(`${match[0]}T00:00:00.000Z`);
        if (!isNaN(date.getTime())) return date;
      }
    }
    throw new BadRequestException('Invalid transaction date format');
  }

  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    // Frontend will provide all calculated values
    const { customerId, ...rest } = createTransactionDto as any;
    // Normalize transactionDate
    if (rest.transactionDate) {
      rest.transactionDate = this.normalizeDate(rest.transactionDate).toISOString();
    }
    const createdTransaction = await this.prisma.transaction.create({
      data: {
        ...rest,
        customer: { connect: { id: customerId } },
      },
    });
    return createdTransaction;
  }

  async findAll(skip?: number, take?: number, customerId?: string, startDate?: Date, endDate?: Date, sortBy?: string, sortOrder?: 'asc' | 'desc') {
    const where: any = { deletedAt: null };
    if (customerId) where.customerId = customerId;
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = startDate;
      if (endDate) where.transactionDate.lte = endDate;
    }
    const safeTake = take ?? 10;
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: safeTake,
        orderBy: sortBy ? { [sortBy]: sortOrder || 'desc' } : { transactionDate: 'desc' },
      }),
      this.prisma.transaction.count({ where }),
    ]);
    return {
      data: transactions,
      meta: {
        total,
        page: skip ? Math.floor(skip / safeTake) + 1 : 1,
        limit: safeTake,
        totalPages: Math.ceil(total / safeTake),
      },
    };
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });
    if (!transaction || (transaction as any).deletedAt) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto): Promise<Transaction> {
    const currentTransaction = await this.findOne(id);
    const updateData = { ...updateTransactionDto };
    if (updateData.transactionDate) {
      updateData.transactionDate = this.normalizeDate(updateData.transactionDate).toISOString();
    }
    const updatedTransaction = await this.prisma.transaction.update({
      where: { id },
      data: updateData,
    });
    return updatedTransaction;
  }

  async remove(id: string): Promise<Transaction> {
    // Soft delete: set deletedAt
    const now = new Date().toISOString();
    const transaction = await this.findOne(id);
    return this.prisma.transaction.update({
      where: { id },
      data: { ...( { deletedAt: now } as any ) },
    });
  }

  // Remove getStats method (not compatible with MongoDB/Prisma schema)

  // List transactions for a customer with filters and pagination
  async listCustomerTransactions(customerId: string, filter: TransactionFilterDto) {
    const {
      paymentStatus,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'transactionDate',
      sortOrder = 'desc',
    } = filter;
    const where: any = { customerId };
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = new Date(startDate);
      if (endDate) where.transactionDate.lte = new Date(endDate);
    }
    const total = await this.prisma.transaction.count({ where });
    const data = await this.prisma.transaction.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });
    return {
      data,
      pagination: { page, limit, total },
    };
  }

  // Create a transaction for a customer
  async createCustomerTransaction(customerId: string, dto: CreateCustomerTransactionDto) {
    // Assumption: All calculations (amounts, balances) are done on frontend
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new BadRequestException('Customer not found');
    
    const { vendorId, ...transactionFields } = dto;
    
    // Normalize transactionDate
    if (transactionFields.transactionDate) {
      transactionFields.transactionDate = this.normalizeDate(transactionFields.transactionDate).toISOString();
    }
    
    // Generate unique reference number if not provided
    if (!transactionFields.referenceNumber) {
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      transactionFields.referenceNumber = `TXN-${timestamp}-${randomSuffix}`;
    }
    
    // Calculate outstanding balance if not provided
    if (transactionFields.outstandingBalance === undefined) {
      transactionFields.outstandingBalance = transactionFields.priceNGN - transactionFields.amountPaid;
    }
    
    const data = await this.prisma.transaction.create({
      data: {
        ...transactionFields,
        customer: { connect: { id: customerId } },
        transactionType: 'customer' as any,
      },
    });
    return { data };
  }

  // Get a transaction by ID
  async getTransaction(id: string) {
    const data = await this.prisma.transaction.findUnique({ where: { id } });
    if (!data) throw new NotFoundException('Transaction not found');
    return { data };
  }

  // Update a transaction by ID
  async updateTransaction(id: string, dto: UpdateTransactionDto) {
    const exists = await this.prisma.transaction.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Transaction not found');
    const data = await this.prisma.transaction.update({ where: { id }, data: dto });
    return { data };
  }

  // Delete a transaction by ID
  async deleteTransaction(id: string) {
    const exists = await this.prisma.transaction.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Transaction not found');
    await this.prisma.transaction.delete({ where: { id } });
    return { data: true };
  }

  // Generate invoice PDF for a transaction
  async generateInvoicePdf(id: string): Promise<{ pdfBuffer: Buffer; filename: string }> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { customer: true },
    });
    if (!transaction) throw new NotFoundException('Transaction not found');
    // Assumption: Simple invoice layout, can be customized as needed
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});
    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice ID: ${transaction.id}`);
    doc.text(`Customer: ${transaction.customer?.name || ''}`);
    doc.text(`Date: ${transaction.transactionDate}`);
    doc.text(`Item: ${transaction.itemPurchased}`);
    doc.text(`Quantity: ${transaction.quantity}`);
    doc.text(`Price (NGN): ${transaction.priceNGN}`);
    doc.text(`Price (USD): ${transaction.priceUSD}`);
    doc.text(`Other Expenses (NGN): ${transaction.otherExpensesNGN}`);
    doc.text(`Other Expenses (USD): ${transaction.otherExpensesUSD}`);
    doc.text(`Total (NGN): ${transaction.totalNGN}`);
    doc.text(`Total (USD): ${transaction.totalUSD}`);
    doc.text(`Amount Paid: ${transaction.amountPaid}`);
    doc.text(`Outstanding: ${transaction.outstandingBalance}`);
    doc.end();
    const pdfBuffer: Buffer = await new Promise((resolve) => {
      const bufs: Buffer[] = [];
      doc.on('data', (d) => bufs.push(d));
      doc.on('end', () => resolve(Buffer.concat(bufs)));
    });
    const filename = `invoice-${transaction.id}.pdf`;
    return { pdfBuffer, filename };
  }

  // Fetch all transactions with customer name
  async getAllTransactionsWithCustomer() {
    const transactions = await this.prisma.transaction.findMany({
      where: { transactionType: 'customer' },
      include: {
        customer: {
          select: { name: true }
        }
      },
      orderBy: { transactionDate: 'desc' }
    });
    return transactions.map(txn => ({
      ...txn,
      customerName: txn.customer?.name || null,
      customer: undefined
    }));
  }

  // Fetch all vendor transactions with vendor name
  async getAllTransactionsWithVendor() {
    const transactions = await this.prisma.transaction.findMany({
      where: { transactionType: 'vendor' },
      include: {
        vendor: {
          select: { name: true }
        }
      },
      orderBy: { transactionDate: 'desc' }
    });
    return transactions.map(txn => ({
      ...txn,
      vendorName: txn.vendor?.name || null,
      vendor: undefined
    }));
  }
} 