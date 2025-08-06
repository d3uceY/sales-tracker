import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemCategoryDto {
  @ApiProperty({
    description: 'The name of the item category',
    example: 'Electronics',
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'A description of the item category',
    example: 'Electronic devices and accessories',
    type: String,
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Whether the item category is active',
    example: true,
    default: true,
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
} 