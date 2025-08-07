import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Minus, Wallet, TrendingUp, TrendingDown, Download, Filter } from 'lucide-react';
import { useWallet } from '@/context/wallet-context';
import { usePermissions } from '@/context/permissions-context';
import PermissionRestricted from '@/components/permission-restricted';
import WalletTransactionForm from '@/components/wallet/wallet-transaction-form';
import WalletTransactionTable from '@/components/wallet/wallet-transaction-table';
import { formatNgnCurrency as formatNaira } from '@/helpers/currency/formatNaira';

export default function CashWallet() {
  const {
    balance,
    transactions,
    summary,
    loading,
    error,
    fetchWalletData,
    addTransaction
  } = useWallet();

  const { canCreate, canRead } = usePermissions();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  useEffect(() => {
    if (canRead('wallet')) {
      fetchWalletData();
    }
  }, [canRead, fetchWalletData]);

  const handleAddCash = async (data) => {
    try {
      await addTransaction({
        ...data,
        type: 'inflow'
      });
      setIsAddModalOpen(false);
    } catch (error) {
      // error handled in context
    }
  };

  const handleWithdrawCash = async (data) => {
    try {
      await addTransaction({
        ...data,
        type: 'outflow'
      });
      setIsWithdrawModalOpen(false);
    } catch (error) {
      // error handled in context
    }
  };

  const getSummaryForPeriod = (period) => {
    return summary[period] || { inflow: 0, outflow: 0 };
  };

  const currentSummary = getSummaryForPeriod(selectedPeriod);

  return (
    <PermissionRestricted requiredPermission="read">
      <div className="space-y-6 p-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cash Wallet</h1>
            <p className="text-muted-foreground">
              Track and manage your physical cash on hand
            </p>
          </div>

          <PermissionRestricted requiredPermission="create">
            <div className="flex gap-2">
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Cash
              </Button>
              <Button 
                onClick={() => setIsWithdrawModalOpen(true)}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <Minus className="h-4 w-4 mr-2" />
                Withdraw Cash
              </Button>
            </div>
          </PermissionRestricted>
        </div>

        {/* Summary Cards */}
        {/* Cash on Hand card remains above */}
        <Card className="min-w-[350px] min-h-[180px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash on Hand</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNaira(balance)}</div>
            <p className="text-xs text-muted-foreground">
              Current balance
            </p>
          </CardContent>
        </Card>

        {/* Period Filter Tabs */}
        <div className="col-span-full">
          <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Three summary cards in a single row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Inflow */}
          <Card className="w-full min-h-[180px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inflow</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatNaira(currentSummary.inflow)}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedPeriod === 'today' ? 'Today' : 
                 selectedPeriod === 'week' ? 'This week' : 'This month'}
              </p>
            </CardContent>
          </Card>

          {/* Total Outflow */}
          <Card className="w-full min-h-[180px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Outflow</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatNaira(currentSummary.outflow)}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedPeriod === 'today' ? 'Today' : 
                 selectedPeriod === 'week' ? 'This week' : 'This month'}
              </p>
            </CardContent>
          </Card>

          {/* Net Change */}
          <Card className="w-full min-h-[180px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Change</CardTitle>
              <Badge variant={currentSummary.inflow - currentSummary.outflow >= 0 ? "default" : "destructive"}>
                {currentSummary.inflow - currentSummary.outflow >= 0 ? "+" : "-"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                currentSummary.inflow - currentSummary.outflow >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatNaira(Math.abs(currentSummary.inflow - currentSummary.outflow))}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedPeriod === 'today' ? 'Today' : 
                 selectedPeriod === 'week' ? 'This week' : 'This month'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transaction History</CardTitle>
              {/* <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div> */}
            </div>
          </CardHeader>
          <CardContent>
            <WalletTransactionTable 
              transactions={transactions}
              loading={loading}
            />
          </CardContent>
        </Card>

        {/* Modals */}
        <WalletTransactionForm
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          onSubmit={handleAddCash}
          type="inflow"
          title="Add Cash"
        />

        <WalletTransactionForm
          open={isWithdrawModalOpen}
          onOpenChange={setIsWithdrawModalOpen}
          onSubmit={handleWithdrawCash}
          type="outflow"
          title="Withdraw Cash"
        />
      </div>
    </PermissionRestricted>
  );
}
