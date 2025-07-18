import { authAxios } from "./auth"

// Fetch vendors (with optional params for pagination/search)
export const getVendors = async (params) => {
  const response = await authAxios.get("/vendors", { params })
  return response.data
}

// Create a new vendor
export const createVendor = async (vendorData) => {
  const response = await authAxios.post("/vendors", vendorData)
  return response.data
} 