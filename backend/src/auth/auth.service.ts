import { Injectable, UnauthorizedException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SignInDto } from './dto/sign-in.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }
    const saltRounds = this.configService.get('security.password.saltRounds') || 12;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);
    const defaultRole = await this.prisma.role.findFirst({ where: { name: 'Super Admin' } });
    if (!defaultRole) throw new BadRequestException('Default role not found');
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        status: 'active',
        roleId: defaultRole.id,
      },
    });
    const tokens = await this.getTokens(user.id, user.email);
    return tokens;
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: signInDto.email },
      include: { role: true },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!['Admin', 'Super Admin'].includes(user.role?.name)) {
      throw new ForbiddenException('Access denied. Admin privileges required.');
    }
    const isPasswordValid = await bcrypt.compare(signInDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const refreshTokenExpiresIn = signInDto.rememberMe
      ? this.configService.get('security.jwt.refreshToken.rememberMeExpiresIn') || '30d'
      : this.configService.get('security.jwt.refreshToken.expiresIn') || '7d';
    const tokens = await this.getTokens(user.id, user.email, refreshTokenExpiresIn);
    
    // Get user permissions
    const userPermissions = await this.getUserPermissions(user.id);
    
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: [user.role?.name],
        status: user.status,
        permissions: userPermissions.permissions,
      },
    };
  }

  async logout(userId: string, refreshToken: string) {
    return { message: 'Logged out successfully' };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('security.jwt.refreshToken.secret'),
      });
      if (payload.sub !== userId) throw new ForbiddenException('Invalid refresh token');
      const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
      if (!user) throw new UnauthorizedException('User not found');
      const tokens = await this.getTokens(user.id, user.email);
      
      // Get user permissions
      const userPermissions = await this.getUserPermissions(user.id);
      
      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: [user.role?.name],
          status: user.status,
          permissions: userPermissions.permissions,
        },
      };
    } catch (e) {
      throw new ForbiddenException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: 'If your email exists, a reset link has been sent.' };
    }
    const payload = { sub: user.id, email: user.email };
    const options: JwtSignOptions = {
      secret: this.configService.get('security.jwt.passwordReset.secret') || 'RESET_SECRET',
      expiresIn: this.configService.get('security.jwt.passwordReset.expiresIn') || '15m',
    };
    const token = await this.jwtService.signAsync(payload, options);
    const resetUrl = `https://your-frontend-app/reset-password?token=${token}`;
    return { message: 'If your email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('security.jwt.passwordReset.secret') || 'RESET_SECRET',
      });
    } catch (e) {
      throw new BadRequestException('Invalid or expired reset token');
    }
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new BadRequestException('Invalid reset token');
    const saltRounds = this.configService.get('security.password.saltRounds') || 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await this.prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
    return { message: 'Password reset successful.' };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Old password is incorrect');
    const saltRounds = this.configService.get('security.password.saltRounds') || 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });
    return { message: 'Password changed successfully.' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    if (!user) throw new UnauthorizedException('User not found');
    
    // Get user permissions
    const userPermissions = await this.getUserPermissions(user.id);
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: [user.role?.name],
      status: user.status,
      permissions: userPermissions.permissions,
    };
  }

  private async getUserPermissions(userId: string) {
    const user = await this.prisma.user.findUnique({ 
      where: { id: userId },
      include: { role: true }
    });
    
    if (!user) throw new UnauthorizedException('User not found');
    
    const permission = await this.prisma.rolePermission.findFirst({ 
      where: { roleId: user.roleId }
    });
    
    if (!permission) {
      // Return default permissions if none exist
      return {
        userId: user.id,
        roleId: user.roleId,
        roleName: user.role.name,
        permissions: {
          read: true,
          create: false,
          update: false,
          delete: false,
        }
      };
    }
    
    return {
      userId: user.id,
      roleId: user.roleId,
      roleName: user.role.name,
      permissions: {
        read: permission.canRead,
        create: permission.canCreate,
        update: permission.canUpdate,
        delete: permission.canDelete,
      }
    };
  }

  private async getTokens(userId: string, email: string, refreshTokenExpiresIn?: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get('security.jwt.accessToken.secret'),
          expiresIn: this.configService.get('security.jwt.accessToken.expiresIn'),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get('security.jwt.refreshToken.secret'),
          expiresIn: refreshTokenExpiresIn || this.configService.get('security.jwt.refreshToken.expiresIn'),
        },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }
} 