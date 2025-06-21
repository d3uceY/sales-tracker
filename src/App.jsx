import { TransactionProvider } from "./context/TransactionContext"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { DashboardLayout } from "./components/layout/dashboard-layout"
import Dashboard from "./pages/dashboard/dashboard"
import Home from "./pages/Home/Home"
import TransactionHistory from "./pages/transaction-history/TransactionHistory"
import Roles from "./pages/roles/roles"
import Users from "./pages/users/users"
import VendorTransactions from "./pages/vendors/vendors"
import CustomerTransactions from "./pages/customers/customers"
import Settings from "./pages/settings/settings"
import Reports from "./pages/reports/reports"

function App() {
  return (
    <TransactionProvider>
      <Router>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Home />} />
            <Route path="/transaction-history" element={<TransactionHistory />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/users" element={<Users />} />
            <Route path="/vendors" element={<VendorTransactions />} />
            <Route path="/customers" element={<CustomerTransactions />} />
            <Route
              path="/reports"
              element={ <Reports />}
            />
            <Route
              path="/settings"
              element={<Settings />}
            />
          </Routes>
        </DashboardLayout>
      </Router>
    </TransactionProvider>
  )
}

export default App
