import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExchangeRateService {
  constructor(private readonly prisma: PrismaService) {}

  async getExchangeRate() {
    const rate = await this.prisma.exchangeRate.findFirst();
    if (!rate) throw new NotFoundException('Exchange rate not set');
    return rate;
  }

  async upsertExchangeRate(dto: { buyRate: number; sellRate: number }) {
    const existing = await this.prisma.exchangeRate.findFirst();
    if (!existing) {
      return this.prisma.exchangeRate.create({ data: dto });
    } else {
      return this.prisma.exchangeRate.update({
        where: { id: existing.id },
        data: dto,
      });
    }
  }
}