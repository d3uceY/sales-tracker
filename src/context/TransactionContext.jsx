import { useContext, useState, useEffect } from "react";
import { createContext } from "react";
import React from "react";
// import { getTransactions } from "../helpers/api/transaction";


/* ============================
   API context for transactions 
   ============================ */
const TransactionContext = createContext() //*

export const useTransactionData = () => {
    return useContext(TransactionContext)
}

export const TransactionProvider = ({ children }) => {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchTransactions = async () => {
        try {
            const response = await getTransactions()
            setTransactions(response.data)
            setLoading(false)
        } catch (error) {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTransactions()
    }, [])

    return (
        <TransactionContext.Provider value={{ transactions, loading, refreshTransactions: fetchTransactions }}>
            {children}
        </TransactionContext.Provider>
    )
}