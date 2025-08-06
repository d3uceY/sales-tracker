import { ApiProperty } from '@nestjs/swagger';

export class RoleWithPermissionsDto {
  @ApiProperty({
    description: 'Role ID',
    example: '507f1f77bcf86cd799439011',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'Role name',
    example: 'Admin',
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'Role description',
    example: 'Administrator role with full access',
    type: String,
  })
  description: string;

  @ApiProperty({
    description: 'Number of users with this role',
    example: 5,
    type: Number,
  })
  userCount: number;

  @ApiProperty({
    description: 'Role permissions object',
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