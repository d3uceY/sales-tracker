import { authAxios } from "./auth"

// Get roles with pagination and search
export const getRoles = async (params) => {
  const response = await authAxios.get("/roles", { params })
  return response.data
}

// Create a new role
export const createRole = async (data) => {
  const response = await authAxios.post("/roles", data)
  return response.data
}

// Update a role
export const updateRole = async (id, data) => {
  const response = await authAxios.put(`/roles/${id}`, data)
  return response.data
}

// Delete a role
export const deleteRole = async (id) => {
  const response = await authAxios.delete(`/roles/${id}`)
  return response.data
}

// Get role statistics
export const getRoleStats = async () => {
  const response = await authAxios.get("/roles/stats")
  return response.data
} 