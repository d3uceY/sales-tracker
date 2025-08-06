import { IsString, IsEmail, IsIn, IsOptional } from 'class-validator';

export class UpdateBusinessDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIn(['usd', 'ngn', 'both'])
  defaultCurrency?: string;

  @IsOptional()
  @IsIn(['manual', 'auto'])
  exchangeUpdateMode?: string;
} 