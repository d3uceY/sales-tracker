import { authAxios } from "./auth"

// Get all role permissions
export const getRolePermissions = async () => {
  const response = await authAxios.get("/role-permissions")
  return response.data
}

// Get all roles with their permissions
export const getAllRolesWithPermissions = async () => {
  const response = await authAxios.get("/role-permissions/roles/all")
  return response.data
}

// Get permissions for a specific role
export const getRolePermissionsByRole = async (roleId) => {
  const response = await authAxios.get(`/role-permissions/role/${roleId}`)
  return response.data
}

// Get current user's permissions
export const getUserPermissions = async () => {
  const response = await authAxios.get("/role-permissions/user/me")
  return response.data
}

// Update role permissions (all at once)
export const updateRolePermissions = async (roleId, permissions) => {
  const response = await authAxios.put(`/role-permissions/role/${roleId}/permissions`, permissions)
  return response.data
}

// Toggle a specific permission for a role
export const toggleRolePermission = async (roleId, permission) => {
  // Map frontend permission names to backend field names
  const permissionMap = {
    'read': 'canRead',
    'create': 'canCreate', 
    'update': 'canUpdate',
    'delete': 'canDelete'
  }
  
  const backendPermission = permissionMap[permission] || permission
  const response = await authAxios.put(`/role-permissions/role/${roleId}/toggle/${backendPermission}`)
  return response.data
}
