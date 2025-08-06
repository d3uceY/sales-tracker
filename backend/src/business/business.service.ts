import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  async getBusiness() {
    // Singleton: always return the first (and only) business
    const business = await this.prisma.business.findFirst();
    if (!business) throw new NotFoundException('Business info not found');
    return business;
  }

  async upsertBusiness(dto: { name: string; email: string }) {
    const existing = await this.prisma.business.findFirst();
    if (!existing) {
      return this.prisma.business.create({ data: dto });
    } else {
      return this.prisma.business.update({
        where: { id: existing.id },
        data: dto,
      });
    }
  }
} 