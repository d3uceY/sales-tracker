"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { getBusinessInfo } from "@/helpers/api/business"
import { getExchangeRate } from "@/helpers/api/exchange-rate"

const BusinessContext = createContext()

export function BusinessProvider({ children }) {
  const [businessInfo, setBusinessInfo] = useState({
    name: "SalesFlow",
    email: "",
  })
  const [exchangeRates, setExchangeRates] = useState(null) // null until loaded
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchBusinessData = async () => {
    setLoading(true)
    setError("")
    
    try {
      // Fetch business info
      const businessRes = await getBusinessInfo()
      if (businessRes.data) {
        setBusinessInfo({
          name: businessRes.data.name || "SalesFlow",
          email: businessRes.data.email || "",
          logo: businessRes.data.logo || null,
          logoPublicId: businessRes.data.logoPublicId || null,
        })
      }

      // Fetch exchange rates
      const exchangeRes = await getExchangeRate()
      if (exchangeRes.data) {
        setExchangeRates({
          buyRate: exchangeRes.data.buyRate ?? null,
          sellRate: exchangeRes.data.sellRate ?? null,
        })
      }
    } catch (err) {
      setError("Failed to load business data")
      console.error("Error fetching business data:", err)
    } finally {
      setLoading(false)
    }
  }

  const updateBusinessInfo = (newBusinessInfo) => {
    setBusinessInfo(newBusinessInfo)
  }

  const updateExchangeRates = (newExchangeRates) => {
    setExchangeRates(newExchangeRates)
  }

  useEffect(() => {
    fetchBusinessData()
  }, [])

  const value = {
    businessInfo,
    exchangeRates,
    loading,
    error,
    fetchBusinessData,
    updateBusinessInfo,
    updateExchangeRates,
  }

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
}

export function useBusiness() {
  const context = useContext(BusinessContext)
  if (!context) {
    throw new Error("useBusiness must be used within a BusinessProvider")
  }
  return context
} 