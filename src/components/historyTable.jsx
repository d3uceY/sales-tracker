import React from 'react';
import { useTransactionData } from '../context/TransactionContext'; // Assuming this is your data hook
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming you use shadcn/ui
import { formatDate } from '../helpers/date/formatDate';
import { formatNgnCurrency } from '../helpers/currency/formatNaira';
import { formatUsdCurrency } from '../helpers/currency/formatDollars';
import { HistoryTableSkeleton } from './loader/historyTableLoader';

export default function HistoryTable() {
    const { transactions, loading: loadingTransactions } = useTransactionData()

    if (loadingTransactions) {
        return <HistoryTableSkeleton />;
    }

    if (!transactions || transactions.length === 0) {
        return (
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 text-center text-gray-400">
                <h3 className="text-xl font-medium">No Transactions Found</h3>
                <p>Add a new transaction to see your history here.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-4">Date</th>
                            <th scope="col" className="px-6 py-4">Customer</th>
                            <th scope="col" className="px-6 py-4">Item</th>
                            <th scope="col" className="px-6 py-4 text-right">Total (USD)</th>
                            <th scope="col" className="px-6 py-4 text-right">Total (NGN)</th>
                            <th scope="col" className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction) => (
                            <tr key={transaction.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors duration-200">
                                <td className="px-6 py-4 font-medium whitespace-nowrap">{formatDate(transaction.transactionDate)}</td>
                                <td className="px-6 py-4">{transaction.customer}</td>
                                <td className="px-6 py-4">{transaction.item}</td>
                                <td className="px-6 py-4 text-right font-mono text-cyan-400">{formatUsdCurrency(transaction.totalAmountUSD)}</td>
                                <td className="px-6 py-4 text-right font-mono text-emerald-400">{formatNgnCurrency(transaction.totalAmountNGN)}</td>
                                <td className="px-6 py-4 text-center">
                                    <div className='flex justify-center items-center gap-2'>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-600">
                                            <Edit className="h-4 w-4 text-gray-400" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-900/50">
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Table Footer */}
            <div className="p-4 flex justify-between items-center text-gray-500 text-sm">
                {/* <span>
                    Showing <strong>{transactions.length}</strong> of <strong>{transactions.data?.meta?.total}</strong> results
                </span> */}
                <a href="#" className="hover:text-blue-400 transition-colors">View all transactions &rarr;</a>
            </div>
        </div>
    );
}


