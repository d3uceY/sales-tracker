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
import { PermissionsProvider } from "./context/permissions-context"
import CashWallet from "./pages/cash-wallet/cash-wallet"
import { WalletProvider } from "./context/wallet-context"
import CustomerData from "./pages/customer-data/customer-data"
import VendorData from "./pages/vendor-data/vendor-data"

function App() {
  return (
    <AuthProvider>
      <BusinessProvider>
        <PermissionsProvider>
          <CustomerProvider>
            <ItemCategoryProvider>
              <WalletProvider>
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
                              <Route
                                path="/"
                                element={
                                  <TransactionProvider>
                                    <Dashboard />
                                  </TransactionProvider>
                                }
                              />
                              <Route
                                path="/transactions"
                                element={
                                  <TransactionProvider>
                                    <Home />
                                  </TransactionProvider>
                                }
                              />
                              <Route
                                path="/transaction-history"
                                element={
                                  <TransactionProvider>
                                    <TransactionHistory />
                                  </TransactionProvider>
                                }
                              />
                              <Route
                                path="/roles"
                                element={
                                  <TransactionProvider>
                                    <Roles />
                                  </TransactionProvider>
                                }
                              />
                              <Route
                                path="/users"
                                element={
                                  <TransactionProvider>
                                    <Users />
                                  </TransactionProvider>
                                }
                              />
                              <Route
                                path="/customer-data"
                                element={
                                  <TransactionProvider>
                                    <CustomerData />
                                  </TransactionProvider>
                                }
                              />
                              <Route
                                path="/vendor-data"
                                element={
                                  <TransactionProvider>
                                    <VendorData />
                                  </TransactionProvider>
                                }
                              />
                              <Route
                                path="/vendors"
                                element={
                                  <TransactionProvider>
                                    <VendorTransactions />
                                  </TransactionProvider>
                                }
                              />
                              <Route
                                path="/customers"
                                element={
                                  <TransactionProvider>
                                    <CustomerTransactions />
                                  </TransactionProvider>
                                }
                              />
                              <Route
                                path="/reports"
                                element={
                                  <TransactionProvider>
                                    <Reports />
                                  </TransactionProvider>
                                }
                              />
                              <Route
                                path="/settings"
                                element={
                                  <TransactionProvider>
                                    <Settings />
                                  </TransactionProvider>
                                }
                              />
                              <Route path="/wallet" element={<CashWallet />} />
                            </Routes>
                          </DashboardLayout>
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </Router>
              </WalletProvider>
            </ItemCategoryProvider>
          </CustomerProvider>
        </PermissionsProvider>
      </BusinessProvider>
    </AuthProvider>
  )
}

export default App
