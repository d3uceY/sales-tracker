import { ApiProperty } from '@nestjs/swagger';

export class UserPermissionsDto {
  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
    type: String,
  })
  userId: string;

  @ApiProperty({
    description: 'Role ID',
    example: '507f1f77bcf86cd799439012',
    type: String,
  })
  roleId: string;

  @ApiProperty({
    description: 'Role name',
    example: 'Admin',
    type: String,
  })
  roleName: string;

  @ApiProperty({
    description: 'User permissions object',
    type: 'object',
    properties: {
      read: { type: 'boolean', example: true },
      create: { type: 'boolean', example: true },
      update: { type: 'boolean', example: true },
      delete: { type: 'boolean', example: false },
    },
  })
  permissions: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
} 