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
import { AuthProvider } from "./context/auth-context"
import LoginPage from "./pages/auth/login"
import ForgotPasswordPage from "./pages/auth/forgot-password"
import ResetPasswordPage from "./pages/auth/reset-password"
import { ProtectedRoute } from "./components/auth/protected-route"
import { CustomerProvider } from "./context/CustomerContext"
import { ItemCategoryProvider } from "./context/ItemCategoryContext"
import { BusinessProvider } from "./context/BusinessContext"
import { PermissionsProvider } from './context/permissions-context'

function App() {
  return (
    <AuthProvider>
      <BusinessProvider>
        <PermissionsProvider>
          <TransactionProvider>
            <CustomerProvider>
              <ItemCategoryProvider>
                <Router>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                    {/* Protected routes */}
                    <Route
                      path="/*"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout>
                            <Routes>
                              <Route path="/" element={<Dashboard />} />
                              <Route path="/transactions" element={<Home />} />
                              <Route path="/transaction-history" element={<TransactionHistory />} />
                              <Route path="/roles" element={<Roles />} />
                              <Route path="/users" element={<Users />} />
                              <Route path="/vendors" element={<VendorTransactions />} />
                              <Route path="/customers" element={<CustomerTransactions />} />
                              <Route path="/reports" element={<Reports />} />
                              <Route path="/settings" element={<Settings />} />
                            </Routes>
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </Router>
              </ItemCategoryProvider>
            </CustomerProvider>
          </TransactionProvider>
        </PermissionsProvider>
      </BusinessProvider>
    </AuthProvider>
  )
}

export default App
