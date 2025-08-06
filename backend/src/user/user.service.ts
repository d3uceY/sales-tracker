import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UserRole, UserStatus } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';
import { ForbiddenException, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(filter: UserFilterDto): Promise<{ data: UserResponseDto[]; total: number; page: number; limit: number }> {
    const { search, status, role, page = 1, limit = 10 } = filter;
    const where: any = {};
    if (status) where.status = status;
    if (role) where.role = { name: role };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { role: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { role: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      data: data.map(this.toUserResponse),
      total,
      page,
      limit,
    };
  }

  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');
    const role = await this.prisma.role.findUnique({ where: { name: dto.role } });
    if (!role) throw new BadRequestException('Invalid role');
    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        status: dto.status,
        roleId: role.id,
      },
      include: { role: true },
    });
    await this.prisma.role.update({ where: { id: role.id }, data: { userCount: { increment: 1 } } });
    return this.toUserResponse(user);
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!user) throw new NotFoundException('User not found');
    const data: any = { ...dto };
    if (dto.role) {
      const role = await this.prisma.role.findUnique({ where: { name: dto.role } });
      if (!role) throw new BadRequestException('Invalid role');
      data.roleId = role.id;
      delete data.role;
    }
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 12);
    } else {
      delete data.password;
    }
    const updated = await this.prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });
    return this.toUserResponse(updated);
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.user.delete({ where: { id } });
    await this.prisma.role.update({ where: { id: user.roleId }, data: { userCount: { decrement: 1 } } });
    return { message: 'User deleted successfully' };
  }

  async getUserStats() {
    const total = await this.prisma.user.count();
    const active = await this.prisma.user.count({ where: { status: UserStatus.ACTIVE } });
    const inactive = await this.prisma.user.count({ where: { status: UserStatus.INACTIVE } });
    const adminRole = await this.prisma.role.findUnique({ where: { name: UserRole.ADMIN } });
    const superAdminRole = await this.prisma.role.findUnique({ where: { name: UserRole.SUPER_ADMIN } });
    const admin = adminRole ? await this.prisma.user.count({ where: { roleId: adminRole.id } }) : 0;
    const superAdmin = superAdminRole ? await this.prisma.user.count({ where: { roleId: superAdminRole.id } }) : 0;
    return { total, active, inactive, admin, superAdmin };
  }

  private toUserResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      role: {
        id: user.role.id,
        name: user.role.name,
        description: user.role.description,
      },
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };
  }
} 