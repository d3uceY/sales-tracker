import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRolePermissionDto {
  @ApiProperty({
    description: 'The ID of the role to assign permissions to',
    example: '507f1f77bcf86cd799439011',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  roleId?: string;

  @ApiProperty({
    description: 'Whether the role can read data',
    example: true,
    type: Boolean,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  canRead?: boolean;

  @ApiProperty({
    description: 'Whether the role can create new data',
    example: false,
    type: Boolean,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  canCreate?: boolean;

  @ApiProperty({
    description: 'Whether the role can update existing data',
    example: false,
    type: Boolean,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  canUpdate?: boolean;

  @ApiProperty({
    description: 'Whether the role can delete data',
    example: false,
    type: Boolean,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  canDelete?: boolean;
} 