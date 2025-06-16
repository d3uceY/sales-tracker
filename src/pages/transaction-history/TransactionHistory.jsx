import React from 'react'
import HistoryTable from '../../components/historyTable'

export default function TransactionHistory() {
    return (
        <div>
            <header className="text-center mb-12 py-8">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                    Transaction History
                </h1>
                <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
                    Here's a summary of your recent sales activity.
                </p>
            </header>
            <div className="max-w-6xl mx-auto">
                <HistoryTable />
            </div>
        </div>
    )
}
