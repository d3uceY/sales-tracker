import { ApiProperty } from '@nestjs/swagger';

export class RoleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  userCount: number;

  @ApiProperty()
  createdAt: Date;
} 