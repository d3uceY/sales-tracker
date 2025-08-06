import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerFilterDto } from './dto/customer-filter.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  // List customers with filtering, pagination, and sorting
  async listCustomers(filter: CustomerFilterDto) {
    const {
      name,
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'asc',
    } = filter;
    const where: Prisma.CustomerWhereInput = {};
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (status) where.status = status;
    const total = await this.prisma.customer.count({ where });
    const data = await this.prisma.customer.findMany({
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

  // Create a new customer
  async createCustomer(dto: CreateCustomerDto) {
    const exists = await this.prisma.customer.findFirst({ where: { name: dto.name } });
    if (exists) throw new BadRequestException('Customer with this name already exists');
    const data = await this.prisma.customer.create({ data: { name: dto.name, status: dto.status ?? 'active' } });
    return { data };
  }

  // Get customer details with balance and transactions
  async getCustomerDetails(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { transactionDate: 'desc' },
        },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    // Calculate balance: sum(outstandingBalance) from transactions
    const balance = customer.transactions.reduce((acc, t) => acc + (t.outstandingBalance || 0), 0);
    return {
      data: {
        ...customer,
        balance,
        transactions: customer.transactions,
      },
    };
  }

  // Update a customer
  async updateCustomer(id: string, dto: UpdateCustomerDto) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');
    const data = await this.prisma.customer.update({ where: { id }, data: dto });
    return { data };
  }

  // Delete a customer
  async deleteCustomer(id: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');
    // Assumption: Deleting a customer also deletes their transactions (cascade delete not enforced by Prisma for MongoDB)
    await this.prisma.transaction.deleteMany({ where: { customerId: id } });
    await this.prisma.customer.delete({ where: { id } });
    return { data: true };
  }

  // Get customer last transaction outstanding balance by name
  async getCustomerBalanceByName(name: string) {
    // Find customer by name (exact match since name is unique)
    const customer = await this.prisma.customer.findUnique({ 
      where: { name },
      include: {
        transactions: {
          orderBy: { transactionDate: 'desc' },
          take: 1, // Get only the most recent transaction
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with name '${name}' not found`);
    }

    const lastTransaction = customer.transactions[0];
    
    if (!lastTransaction) {
      // Customer exists but has no transactions
      return {
        data: {
          customerName: customer.name,
          lastTransactionId: null,
          lastTransactionDate: null,
          outstandingBalance: 0,
          paymentStatus: null,
          hasTransactions: false
        }
      };
    }

    return {
      data: {
        customerName: customer.name,
        lastTransactionId: lastTransaction.id,
        lastTransactionDate: lastTransaction.transactionDate,
        outstandingBalance: lastTransaction.outstandingBalance || 0,
        paymentStatus: lastTransaction.paymentStatus,
        hasTransactions: true
      }
    };
  }
} 