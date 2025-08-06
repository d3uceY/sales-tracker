import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorDto, UpdateVendorDto, VendorFilterDto, VendorTransactionFilterDto } from './dto';
import { Prisma } from '@prisma/client';
import { UpdateTransactionDto } from '../transaction/dto/update-transaction.dto';
import * as PDFDocument from 'pdfkit';
import { CreateVendorTransactionDto } from './dto/create-vendor-transaction.dto';

@Injectable()
export class VendorService {
  constructor(private prisma: PrismaService) {}

  /**
   * List vendors with filtering, search, and pagination
   */
  async listVendors(filter: VendorFilterDto, user: any) {
    // TODO: Add role-based access if needed
    const { name, status, page = 1, limit = 20 } = filter;
    const where: any = {};
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (status) where.status = status;
    const [vendors, total] = await this.prisma.$transaction([
      this.prisma.vendor.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vendor.count({ where }),
    ]);
    return {
      data: vendors,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a new vendor
   */
  async createVendor(dto: CreateVendorDto, user: any) {
    // TODO: Add role-based access if needed
    // Use findFirst instead of findUnique for name uniqueness check
    const exists = await this.prisma.vendor.findFirst({ where: { name: dto.name } });
    if (exists) throw new BadRequestException('Vendor name already exists');
    const vendor = await this.prisma.vendor.create({ data: { ...dto } });
    return { data: vendor };
  }

  /**
   * Get vendor details with purchase summary and recent transactions
   */
  async getVendorById(id: string, user: any) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: { transactions: { where: { ...( { deletedAt: null } as any ) }, orderBy: { transactionDate: 'desc' }, take: 5 } },
    });
    if (!vendor) throw new NotFoundException('Vendor not found');
    // Calculate summary
    const [totalSpent, totalUnpaid, transactionCount] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { ...( { vendorId: id, deletedAt: null } as any ) },
        _sum: { priceUSD: true },
      }),
      this.prisma.transaction.aggregate({
        where: { ...( { vendorId: id, paymentStatus: { not: 'paid' }, deletedAt: null } as any ) },
        _sum: { outstandingBalance: true },
      }),
      this.prisma.transaction.count({ where: { ...( { vendorId: id, deletedAt: null } as any ) } }),
    ]);
    return {
      data: {
        id: vendor.id,
        name: vendor.name,
        status: vendor.status,
        createdAt: vendor.createdAt,
        updatedAt: vendor.updatedAt,
        totalSpent: (totalSpent._sum?.priceUSD ?? 0),
        totalUnpaid: (totalUnpaid._sum?.outstandingBalance ?? 0),
        transactionCount,
        recentTransactions: (vendor as any).transactions,
      },
    };
  }

  /**
   * Update vendor
   */
  async updateVendor(id: string, dto: UpdateVendorDto, user: any) {
    // TODO: Add role-based access if needed
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    if (dto.name && dto.name !== vendor.name) {
      // Use findFirst instead of findUnique for name uniqueness check
      const exists = await this.prisma.vendor.findFirst({ where: { name: dto.name } });
      if (exists) throw new BadRequestException('Vendor name already exists');
    }
    const updated = await this.prisma.vendor.update({ where: { id }, data: dto });
    return { data: updated };
  }

  /**
   * Delete vendor
   */
  async deleteVendor(id: string, user: any) {
    // TODO: Add role-based access if needed
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    await this.prisma.vendor.delete({ where: { id } });
    return { data: { id } };
  }

  /**
   * List transactions for a vendor with filtering and pagination
   */
  async listVendorTransactions(vendorId: string, filter: VendorTransactionFilterDto, user: any) {
    // TODO: Add role-based access if needed
    const { startDate, endDate, paymentStatus, page = 1, limit = 20, sortBy = 'transactionDate', sortOrder = 'desc' } = filter;
    const where: any = { ...( { vendorId, deletedAt: null } as any ) };
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = new Date(startDate);
      if (endDate) where.transactionDate.lte = new Date(endDate);
    }
    if (paymentStatus) where.paymentStatus = paymentStatus;
    const [transactions, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.transaction.count({ where }),
    ]);
    return {
      data: transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a transaction for a vendor
   */
  async createVendorTransaction(vendorId: string, dto: CreateVendorTransactionDto, user: any) {
    const vendor = await this.prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) throw new NotFoundException('Vendor not found');
    let { transactionDate, ...rest } = dto;
    // Normalize transactionDate to ISO string
    if (transactionDate) {
      transactionDate = new Date(transactionDate).toISOString();
    }
    const transaction = await this.prisma.transaction.create({
      data: { ...(rest as any), transactionDate, vendor: { connect: { id: vendorId } }, transactionType: 'vendor' as any },
    });
    return { data: transaction };
  }

  /**
   * Get a vendor transaction by ID
   */
  async getVendorTransaction(id: string, user: any) {
    // TODO: Add role-based access if needed
    const transaction = await this.prisma.transaction.findUnique({ where: { id } });
    if (!transaction || !transaction.vendorId) throw new NotFoundException('Vendor transaction not found');
    return { data: transaction };
  }

  /**
   * Update a vendor transaction by ID
   */
  async updateVendorTransaction(id: string, dto: UpdateTransactionDto, user: any) {
    // TODO: Add role-based access if needed
    const transaction = await this.prisma.transaction.findUnique({ where: { id } });
    if (!transaction || !transaction.vendorId) throw new NotFoundException('Vendor transaction not found');
    const updateData = { ...dto };
    if (updateData.transactionDate) {
      updateData.transactionDate = new Date(updateData.transactionDate).toISOString();
    }
    const updated = await this.prisma.transaction.update({ where: { id }, data: updateData });
    return { data: updated };
  }

  /**
   * Delete a vendor transaction by ID
   */
  async deleteVendorTransaction(id: string, user: any) {
    // Soft delete: set deletedAt
    const transaction = await this.prisma.transaction.findUnique({ where: { id } });
    if (!transaction || !transaction.vendorId) throw new NotFoundException('Vendor transaction not found');
    const now = new Date().toISOString();
    await this.prisma.transaction.update({ where: { id }, data: { ...( { deletedAt: now } as any ) } });
    return { data: true };
  }

  /**
   * Generate invoice PDF for a vendor transaction
   */
  async generateVendorInvoicePdf(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { vendor: true },
    });
    if (!transaction || !transaction.vendor) throw new NotFoundException('Vendor transaction not found');
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});
    doc.fontSize(20).text('Vendor Purchase Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice ID: ${transaction.id}`);
    doc.text(`Vendor: ${transaction.vendor?.name || ''}`);
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
    const filename = `vendor-invoice-${transaction.id}.pdf`;
    return { pdfBuffer, filename };
  }
} 