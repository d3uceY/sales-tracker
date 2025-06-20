import { TransactionProvider } from "./context/TransactionContext"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { DashboardLayout } from "./components/layout/dashboard-layout"
import Dashboard from "./pages/dashboard/dashboard"
import Home from "./pages/Home/Home"
import TransactionHistory from "./pages/transaction-history/TransactionHistory"

function App() {
  return (
    <TransactionProvider>
      <Router>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Home />} />
            <Route path="/transaction-history" element={<TransactionHistory />} />
            <Route
              path="/roles"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Roles Management</h1>
                  <p className="text-gray-600 mt-2">Coming soon...</p>
                </div>
              }
            />
            <Route
              path="/users"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">User Management</h1>
                  <p className="text-gray-600 mt-2">Coming soon...</p>
                </div>
              }
            />
            <Route
              path="/vendors"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Vendor Management</h1>
                  <p className="text-gray-600 mt-2">Coming soon...</p>
                </div>
              }
            />
            <Route
              path="/customers"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Customer Management</h1>
                  <p className="text-gray-600 mt-2">Coming soon...</p>
                </div>
              }
            />
            <Route
              path="/reports"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Reports</h1>
                  <p className="text-gray-600 mt-2">Coming soon...</p>
                </div>
              }
            />
            <Route
              path="/settings"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Settings</h1>
                  <p className="text-gray-600 mt-2">Coming soon...</p>
                </div>
              }
            />
          </Routes>
        </DashboardLayout>
      </Router>
    </TransactionProvider>
  )
}

export default App
