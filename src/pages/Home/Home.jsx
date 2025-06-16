import TransactionFormDialog from "../../components/formDialog"
import { Link } from "react-router-dom"

function Home() {

    return (
        <div className="container mx-auto px-4 py-8 md:py-16">

            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                    Track your transactions
                </h1>
                <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
                    Welcome back. Here's a summary of your recent sales activity.
                </p>
            </header>

            <section className="text-center mb-16">
                <TransactionFormDialog />
            </section>

            <section>
                <h2 className="text-2xl font-semibold text-gray-300 mb-6 text-center md:text-left">Transaction Tracker</h2>
                <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-300">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Date</th>
                                    <th scope="col" className="px-6 py-4">Customer</th>
                                    <th scope="col" className="px-6 py-4">Item</th>
                                    <th scope="col" className="px-6 py-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>

                                <tr className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors duration-200">
                                    <td className="px-6 py-4 font-medium">Jun 16, 2025</td>
                                    <td className="px-6 py-4">Acme Corp</td>
                                    <td className="px-6 py-4">Web Development Services</td>
                                    <td className="px-6 py-4 text-right font-mono text-emerald-400">₦2,500,000.00</td>
                                </tr>

                                <tr className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors duration-200">
                                    <td className="px-6 py-4 font-medium">Jun 15, 2025</td>
                                    <td className="px-6 py-4">Tech Solutions Ltd</td>
                                    <td className="px-6 py-4">Monthly Retainer</td>
                                    <td className="px-6 py-4 text-right font-mono text-emerald-400">₦1,200,000.00</td>
                                </tr>

                                <tr className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors duration-200">
                                    <td className="px-6 py-4 font-medium">Jun 14, 2025</td>
                                    <td className="px-6 py-4">Global Imports Inc</td>
                                    <td className="px-6 py-4">Product Shipment #A-781</td>
                                    <td className="px-6 py-4 text-right font-mono text-emerald-400">₦850,500.00</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 text-center text-gray-500 text-sm">
                        <Link to="/transaction-history" className="hover:text-blue-400 transition-colors">View all transactions &rarr;</Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home
