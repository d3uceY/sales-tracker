import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleResponseDto } from './dto/role-response.dto';
import { NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async listRoles({ search, page = 1, limit = 10 }: { search?: string; page?: number; limit?: number }) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.role.count({ where }),
    ]);
    return {
      data: data.map(this.toRoleResponse),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createRole(dto: CreateRoleDto): Promise<RoleResponseDto> {
    const exists = await this.prisma.role.findUnique({ where: { name: dto.name } });
    if (exists) throw new ConflictException('Role name must be unique');
    const role = await this.prisma.role.create({ data: dto });
    return this.toRoleResponse(role);
  }

  async updateRole(id: string, dto: UpdateRoleDto): Promise<RoleResponseDto> {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    if (dto.name && dto.name !== role.name) {
      const exists = await this.prisma.role.findUnique({ where: { name: dto.name } });
      if (exists) throw new ConflictException('Role name must be unique');
    }
    const updated = await this.prisma.role.update({ where: { id }, data: dto });
    return this.toRoleResponse(updated);
  }

  async deleteRole(id: string): Promise<{ message: string }> {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    if (role.userCount > 0) throw new BadRequestException('Role cannot be deleted because it has assigned users');
    await this.prisma.role.delete({ where: { id } });
    return { message: 'Role deleted successfully' };
  }

  async getRoleStats() {
    const total = await this.prisma.role.count();
    const roles = await this.prisma.role.findMany();
    const totalActiveUsers = roles.reduce((sum, r) => sum + r.userCount, 0);
    let mostUsedRole: any = null;
    let maxCount = 0;
    for (const r of roles) {
      if (r.userCount > maxCount) {
        maxCount = r.userCount;
        mostUsedRole = r;
      }
    }
    return {
      totalRoles: total,
      totalActiveUsers,
      mostUsedRole: mostUsedRole ? this.toRoleResponse(mostUsedRole) : null,
    };
  }

  private toRoleResponse(role: any): RoleResponseDto {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      userCount: role.userCount,
      createdAt: role.createdAt,
    };
  }
} 