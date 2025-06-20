import { SummaryCards } from "../../components/dashboard/summary-cards"
import { CashflowChart } from "../../components/dashboard/cashflow-chart"
import { IncomeExpense } from "../../components/dashboard/income-expense"
import { RecentInvoices } from "../../components/dashboard/recent-invoices"
import { RecentBills } from "../../components/dashboard/recent-bills"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your business today.</p>
      </div>

      {/* Summary Cards */}
      <SummaryCards />

      {/* Income vs Expense */}
      <IncomeExpense />

      {/* Cashflow Chart */}
      <CashflowChart />

      {/* Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RecentInvoices />
        <RecentBills />
      </div>
    </div>
  )
}
