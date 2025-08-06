import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';

@Injectable()
export class RolePermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.rolePermission.findMany({ include: { role: true } });
  }

  async findOne(id: string) {
    const permission = await this.prisma.rolePermission.findUnique({ where: { id }, include: { role: true } });
    if (!permission) throw new NotFoundException('Role permission not found');
    return permission;
  }

  async create(dto: CreateRolePermissionDto) {
    return this.prisma.rolePermission.create({ data: dto });
  }

  async update(id: string, dto: UpdateRolePermissionDto) {
    await this.findOne(id); // Throws if not found
    return this.prisma.rolePermission.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id); // Throws if not found
    return this.prisma.rolePermission.delete({ where: { id } });
  }

  // New methods for frontend permission system

  async getPermissionsByRole(roleId: string) {
    const permission = await this.prisma.rolePermission.findFirst({ 
      where: { roleId },
      include: { role: true }
    });
    
    if (!permission) {
      // Create default permissions if none exist
      return this.createDefaultPermissions(roleId);
    }
    
    return permission;
  }

  async getPermissionsByRoleName(roleName: string) {
    const role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new NotFoundException('Role not found');
    
    return this.getPermissionsByRole(role.id);
  }

  async getUserPermissions(userId: string) {
    const user = await this.prisma.user.findUnique({ 
      where: { id: userId },
      include: { role: true }
    });
    
    if (!user) throw new NotFoundException('User not found');
    
    const permission = await this.getPermissionsByRole(user.roleId);
    
    return {
      userId: user.id,
      roleId: user.roleId,
      roleName: user.role.name,
      permissions: {
        read: permission.canRead,
        create: permission.canCreate,
        update: permission.canUpdate,
        delete: permission.canDelete,
      }
    };
  }

  async getAllRolesWithPermissions() {
    const roles = await this.prisma.role.findMany({
      include: {
        permissions: true,
        _count: {
          select: { users: true }
        }
      }
    });

    return roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      userCount: role._count.users,
      permissions: role.permissions?.[0] ? {
        read: role.permissions[0].canRead,
        create: role.permissions[0].canCreate,
        update: role.permissions[0].canUpdate,
        delete: role.permissions[0].canDelete,
      } : {
        read: true,
        create: false,
        update: false,
        delete: false,
      }
    }));
  }

  async togglePermission(roleId: string, permission: 'canRead' | 'canCreate' | 'canUpdate' | 'canDelete') {
    let rolePermission = await this.prisma.rolePermission.findFirst({ where: { roleId } });
    
    if (!rolePermission) {
      // Create default permissions if none exist
      rolePermission = await this.createDefaultPermissions(roleId);
    }
    
    const updatedPermission = await this.prisma.rolePermission.update({
      where: { id: rolePermission.id },
      data: { [permission]: !rolePermission[permission] },
      include: { role: true }
    });
    
    return updatedPermission;
  }

  async updateRolePermissions(roleId: string, permissions: {
    canRead?: boolean;
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
  }) {
    let rolePermission = await this.prisma.rolePermission.findFirst({ where: { roleId } });
    
    if (!rolePermission) {
      // Create new permissions
      return this.prisma.rolePermission.create({
        data: {
          roleId,
          canRead: permissions.canRead ?? true,
          canCreate: permissions.canCreate ?? false,
          canUpdate: permissions.canUpdate ?? false,
          canDelete: permissions.canDelete ?? false,
        },
        include: { role: true }
      });
    }
    
    // Update existing permissions
    return this.prisma.rolePermission.update({
      where: { id: rolePermission.id },
      data: permissions,
      include: { role: true }
    });
  }

  private async createDefaultPermissions(roleId: string) {
    return this.prisma.rolePermission.create({
      data: {
        roleId,
        canRead: true,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
      },
      include: { role: true }
    });
  }
} 