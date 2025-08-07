import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNgnCurrency as formatNaira } from '@/helpers/currency/formatNaira';
import { formatDate } from '@/helpers/date/formatDate';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function WalletTransactionTable({ transactions, loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No transactions found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium">Date</th>
            <th className="text-left py-3 px-4 font-medium">Type</th>
            <th className="text-left py-3 px-4 font-medium">Amount</th>
            <th className="text-left py-3 px-4 font-medium">Reason</th>
            {/* <th className="text-left py-3 px-4 font-medium">Performed By</th> */}
            <th className="text-left py-3 px-4 font-medium">Description</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b hover:bg-muted/50">
              <td className="py-3 px-4">
                {formatDate(transaction.date)}
              </td>
              <td className="py-3 px-4">
                <Badge 
                  variant={transaction.type === 'inflow' ? 'default' : 'destructive'}
                  className="flex items-center gap-1 w-fit"
                >
                  {transaction.type === 'inflow' ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {transaction.type === 'inflow' ? 'Inflow' : 'Outflow'}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <span className={`font-medium ${
                  transaction.type === 'inflow' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'inflow' ? '+' : '-'}{formatNaira(transaction.amount)}
                </span>
              </td>
              <td className="py-3 px-4">
                {transaction.reason}
              </td>
              {/* <td className="py-3 px-4">
                {transaction.performedBy}
              </td> */}
              <td className="py-3 px-4">
                <span className="text-muted-foreground text-sm">
                  {transaction.description || '-'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
