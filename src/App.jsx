
import { TransactionProvider } from "./context/TransactionContext"
import Home from "./pages/Home/Home"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import TransactionHistory from "./pages/transaction-history/TransactionHistory"

function App() {

  return (
    <TransactionProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/transaction-history" element={<TransactionHistory />} />
        </Routes>
      </Router>
    </TransactionProvider>
  )
}

export default App
