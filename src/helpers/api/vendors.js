import { authAxios } from "./auth"

// Fetch vendors (with optional params for pagination/search)
export const getVendors = async (params = {}) => {
  const response = await authAxios.get("/vendors", { params })
  return response.data
}

// Get vendor details with transactions
export const getVendor = async (id) => {
  const response = await authAxios.get(`/vendors/${id}`)
  return response.data
}

// Create a new vendor
export const createVendor = async (vendorData) => {
  const response = await authAxios.post("/vendors", vendorData)
  return response.data
}

// Update a vendor
export const updateVendor = async (id, vendorData) => {
  const response = await authAxios.put(`/vendors/${id}`, vendorData)
  return response.data
}

// Delete a vendor
export const deleteVendor = async (id) => {
  const response = await authAxios.delete(`/vendors/${id}`)
  return response.data
}

// Get vendor transactions
export const getVendorTransactions = async (vendorId, params = {}) => {
  const response = await authAxios.get(`/vendors/transactions/by-identifier?identifier=${vendorId}`, { params })
  return response.data
}

// Get vendor balance by name
export const getVendorBalanceByName = async (vendorName) => {
  const response = await authAxios.get(`/vendors/balance/${encodeURIComponent(vendorName)}`)
  return response.data
}