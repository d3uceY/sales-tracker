import { IsString, IsEmail, IsIn } from 'class-validator';

export class CreateBusinessDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsIn(['usd', 'ngn', 'both'])
  defaultCurrency: string;

  @IsIn(['manual', 'auto'])
  exchangeUpdateMode: string;
} 