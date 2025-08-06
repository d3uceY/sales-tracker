import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TransactionModule } from './transaction/transaction.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import securityConfig from './config/security.config';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { CustomerModule } from './customer/customer.module';
import { ReportsModule } from './reports/reports.module';
import { VendorModule } from './vendor/vendor.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { BusinessModule } from './business/business.module';
import { ItemCategoryModule } from './item-category/item-category.module';
import { RolePermissionModule } from './role-permission/role-permission.module';
import { ExchangeRateModule } from './exchange-rate/exchange-rate.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [securityConfig],
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    TransactionModule,
    UserModule,
    RoleModule,
    CustomerModule,
    ReportsModule,
    VendorModule,
    DashboardModule,
    BusinessModule,
    ItemCategoryModule,
    RolePermissionModule,
    ExchangeRateModule,
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 5,
    }]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {} 