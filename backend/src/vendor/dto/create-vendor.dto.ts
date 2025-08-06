import { IsString, IsOptional, IsIn, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVendorDto {
  @ApiProperty({ example: 'Acme Supplies', description: 'Vendor name' })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({ example: 'active', required: false, enum: ['active', 'inactive'] })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive'])
  status?: string = 'active';
} 