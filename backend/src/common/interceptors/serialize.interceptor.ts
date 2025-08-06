import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

export class SerializeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      map((data) => {
        if (Array.isArray(data.data)) {
          // For findAll and getStats (recentTransactions)
          return {
            ...data,
            data: data.data.map((item: any) => this.formatTransactionDate(item)),
          };
        } else if (data.recentTransactions && Array.isArray(data.recentTransactions)) {
          // For getStats specifically
          return {
            ...data,
            recentTransactions: data.recentTransactions.map((item: any) => this.formatTransactionDate(item)),
          };
        } else if (data.transactionDate) {
          // For create, findOne, update
          return this.formatTransactionDate(data);
        }
        return data;
      }),
    );
  }

  private formatTransactionDate(item: any): any {
    if (item.transactionDate && typeof item.transactionDate.toISOString === 'function') {
      return { ...item, transactionDate: item.transactionDate.toISOString().split('T')[0] };
    }
    return item;
  }
} 