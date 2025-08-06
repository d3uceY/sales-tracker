import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ItemCategoryService } from './item-category.service';
import { CreateItemCategoryDto } from './dto/create-item-category.dto';
import { UpdateItemCategoryDto } from './dto/update-item-category.dto';
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

@ApiTags('item-categories')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('item-categories')
export class ItemCategoryController {
  constructor(private readonly itemCategoryService: ItemCategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all item categories' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all item categories retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'uuid-string' },
          name: { type: 'string', example: 'Electronics' },
          description: { type: 'string', example: 'Electronic devices and accessories' },
          active: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll() {
    return this.itemCategoryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get item category by ID' })
  @ApiParam({ 
    name: 'id', 
    description: 'Item category ID', 
    example: 'uuid-string' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Item category retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-string' },
        name: { type: 'string', example: 'Electronics' },
        description: { type: 'string', example: 'Electronic devices and accessories' },
        active: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Item category not found' })
  async findOne(@Param('id') id: string) {
    return this.itemCategoryService.findOne(id);
  }

  @Post()
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Create a new item category' })
  @ApiBody({ 
    type: CreateItemCategoryDto,
    description: 'Item category data to create',
    examples: {
      electronics: {
        summary: 'Electronics Category',
        value: {
          name: 'Electronics',
          description: 'Electronic devices and accessories',
          active: true
        }
      },
      clothing: {
        summary: 'Clothing Category',
        value: {
          name: 'Clothing',
          description: 'Apparel and fashion items',
          active: true
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Item category created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-string' },
        name: { type: 'string', example: 'Electronics' },
        description: { type: 'string', example: 'Electronic devices and accessories' },
        active: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async create(@Body() dto: CreateItemCategoryDto) {
    return this.itemCategoryService.create(dto);
  }

  @Put(':id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Update an existing item category' })
  @ApiParam({ 
    name: 'id', 
    description: 'Item category ID to update', 
    example: 'uuid-string' 
  })
  @ApiBody({ 
    type: UpdateItemCategoryDto,
    description: 'Item category data to update',
    examples: {
      updateName: {
        summary: 'Update Name Only',
        value: {
          name: 'Updated Electronics'
        }
      },
      updateDescription: {
        summary: 'Update Description Only',
        value: {
          description: 'Updated description for electronic devices'
        }
      },
      updateAll: {
        summary: 'Update All Fields',
        value: {
          name: 'Updated Electronics',
          description: 'Updated description for electronic devices',
          active: false
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Item category updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-string' },
        name: { type: 'string', example: 'Updated Electronics' },
        description: { type: 'string', example: 'Updated description for electronic devices' },
        active: { type: 'boolean', example: false },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Item category not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateItemCategoryDto) {
    return this.itemCategoryService.update(id, dto);
  }

  @Delete(':id')
  @Roles('Super Admin', 'Admin')
  @ApiOperation({ summary: 'Delete an item category' })
  @ApiParam({ 
    name: 'id', 
    description: 'Item category ID to delete', 
    example: 'uuid-string' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Item category deleted successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'uuid-string' },
        name: { type: 'string', example: 'Electronics' },
        description: { type: 'string', example: 'Electronic devices and accessories' },
        active: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Item category not found' })
  async remove(@Param('id') id: string) {
    return this.itemCategoryService.remove(id);
  }
} 