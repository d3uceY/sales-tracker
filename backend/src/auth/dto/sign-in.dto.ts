import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The password of the user (minimum 6 characters)',
    example: 'password123',
    required: true,
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
  
  /**
   * If true, issues a longer-lived refresh token.
   */
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
} 