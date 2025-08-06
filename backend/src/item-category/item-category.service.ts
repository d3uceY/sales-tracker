import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemCategoryDto } from './dto/create-item-category.dto';
import { UpdateItemCategoryDto } from './dto/update-item-category.dto';

@Injectable()
export class ItemCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.itemCategory.findMany();
  }

  async findOne(id: string) {
    const category = await this.prisma.itemCategory.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Item category not found');
    return category;
  }

  async create(dto: CreateItemCategoryDto) {
    return this.prisma.itemCategory.create({ data: dto });
  }

  async update(id: string, dto: UpdateItemCategoryDto) {
    await this.findOne(id); // Throws if not found
    return this.prisma.itemCategory.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id); // Throws if not found
    return this.prisma.itemCategory.delete({ where: { id } });
  }
} 