import { authAxios } from "./auth"

// Get users with pagination, search, and filter
export const getUsers = async (params) => {
  const response = await authAxios.get("/users", { params })
  return response.data
}

// Create a new user
export const createUser = async (data) => {
  const response = await authAxios.post("/users", data)
  return response.data
}

// Update a user
export const updateUser = async (id, data) => {
  const response = await authAxios.put(`/users/${id}`, data)
  return response.data
}

// Delete a user
export const deleteUser = async (id) => {
  const response = await authAxios.delete(`/users/${id}`)
  return response.data
}

// Get user statistics
export const getUserStats = async () => {
  const response = await authAxios.get("/users/stats")
  return response.data
} 