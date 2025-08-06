import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from './create-user.dto';

export class UserRoleDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: UserRole })
  name: UserRole;

  @ApiProperty()
  description: string;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty({ type: UserRoleDto })
  role: UserRoleDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  lastLogin?: Date;
} 