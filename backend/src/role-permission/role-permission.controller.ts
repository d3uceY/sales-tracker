import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { RolePermissionService } from './role-permission.service';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiBody 
} from '@nestjs/swagger';
import { GetCurrentUser } from '../auth/decorators/get-current-user.decorator';

@ApiTags('role-permissions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('role-permissions')
export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all role permissions' })
  @ApiResponse({ status: 200, description: 'List of all role permissions' })
  async findAll() {
    return this.rolePermissionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role permission by ID' })
  @ApiParam({ name: 'id', description: 'Role permission ID' })
  @ApiResponse({ status: 200, description: 'Role permission details' })
  @ApiResponse({ status: 404, description: 'Role permission not found' })
  async findOne(@Param('id') id: string) {
    return this.rolePermissionService.findOne(id);
  }

  @Post()
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Create a new role permission' })
  @ApiBody({ type: CreateRolePermissionDto })
  @ApiResponse({ status: 201, description: 'Role permission created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async create(@Body() dto: CreateRolePermissionDto) {
    return this.rolePermissionService.create(dto);
  }

  @Put(':id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update a role permission' })
  @ApiParam({ name: 'id', description: 'Role permission ID' })
  @ApiBody({ type: UpdateRolePermissionDto })
  @ApiResponse({ status: 200, description: 'Role permission updated successfully' })
  @ApiResponse({ status: 404, description: 'Role permission not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async update(@Param('id') id: string, @Body() dto: UpdateRolePermissionDto) {
    return this.rolePermissionService.update(id, dto);
  }

  @Delete(':id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Delete a role permission' })
  @ApiParam({ name: 'id', description: 'Role permission ID' })
  @ApiResponse({ status: 200, description: 'Role permission deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role permission not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async remove(@Param('id') id: string) {
    return this.rolePermissionService.remove(id);
  }

  // New endpoints for frontend permission system

  @Get('user/me')
  @ApiOperation({ summary: 'Get current user permissions' })
  @ApiResponse({ 
    status: 200, 
    description: 'Current user permissions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        roleId: { type: 'string' },
        roleName: { type: 'string' },
        permissions: {
          type: 'object',
          properties: {
            read: { type: 'boolean' },
            create: { type: 'boolean' },
            update: { type: 'boolean' },
            delete: { type: 'boolean' }
          }
        }
      }
    }
  })
  async getCurrentUserPermissions(@GetCurrentUser('sub') userId: string) {
    return this.rolePermissionService.getUserPermissions(userId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user permissions by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User permissions retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserPermissions(@Param('userId') userId: string) {
    return this.rolePermissionService.getUserPermissions(userId);
  }

  @Get('role/:roleId')
  @ApiOperation({ summary: 'Get permissions by role ID' })
  @ApiParam({ name: 'roleId', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role permissions retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async getPermissionsByRole(@Param('roleId') roleId: string) {
    return this.rolePermissionService.getPermissionsByRole(roleId);
  }

  @Get('role/name/:roleName')
  @ApiOperation({ summary: 'Get permissions by role name' })
  @ApiParam({ name: 'roleName', description: 'Role name' })
  @ApiResponse({ status: 200, description: 'Role permissions retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async getPermissionsByRoleName(@Param('roleName') roleName: string) {
    return this.rolePermissionService.getPermissionsByRoleName(roleName);
  }

  @Get('roles/all')
  @ApiOperation({ summary: 'Get all roles with their permissions' })
  @ApiResponse({ 
    status: 200, 
    description: 'All roles with permissions retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          userCount: { type: 'number' },
          permissions: {
            type: 'object',
            properties: {
              read: { type: 'boolean' },
              create: { type: 'boolean' },
              update: { type: 'boolean' },
              delete: { type: 'boolean' }
            }
          }
        }
      }
    }
  })
  async getAllRolesWithPermissions() {
    return this.rolePermissionService.getAllRolesWithPermissions();
  }

  @Put('role/:roleId/toggle/:permission')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Toggle a specific permission for a role' })
  @ApiParam({ name: 'roleId', description: 'Role ID' })
  @ApiParam({ 
    name: 'permission', 
    description: 'Permission to toggle',
    enum: ['canRead', 'canCreate', 'canUpdate', 'canDelete']
  })
  @ApiResponse({ status: 200, description: 'Permission toggled successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async togglePermission(
    @Param('roleId') roleId: string,
    @Param('permission') permission: 'canRead' | 'canCreate' | 'canUpdate' | 'canDelete'
  ) {
    return this.rolePermissionService.togglePermission(roleId, permission);
  }

  @Put('role/:roleId/permissions')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update all permissions for a role' })
  @ApiParam({ name: 'roleId', description: 'Role ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        canRead: { type: 'boolean' },
        canCreate: { type: 'boolean' },
        canUpdate: { type: 'boolean' },
        canDelete: { type: 'boolean' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Role permissions updated successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async updateRolePermissions(
    @Param('roleId') roleId: string,
    @Body() permissions: {
      canRead?: boolean;
      canCreate?: boolean;
      canUpdate?: boolean;
      canDelete?: boolean;
    }
  ) {
    return this.rolePermissionService.updateRolePermissions(roleId, permissions);
  }
} 