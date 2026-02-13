import apiClient from './axiosConfig';

const BASE_PATH = '/roles-permissions';

export const rolePermissionApi = {
  // ========================================
  // PERMISSION ENDPOINTS
  // ========================================
  
  // Get all permissions
  getAllPermissions: () => apiClient.get(`${BASE_PATH}/permissions`),

  // Get permissions grouped by module
  getPermissionsByModule: () => apiClient.get(`${BASE_PATH}/permissions/by-module`),

  // ========================================
  // ROLE ENDPOINTS
  // ========================================

  // Get all roles
  getAllRoles: () => apiClient.get(`${BASE_PATH}/roles`),

  // Get role details with permissions
  getRolePermissions: (role) => apiClient.get(`${BASE_PATH}/roles/${role}`),

  // Get all roles with their permissions
  getAllRolePermissions: () => apiClient.get(`${BASE_PATH}/roles/all`),

  // ========================================
  // PERMISSION MATRIX
  // ========================================

  // Get complete permission matrix
  getPermissionMatrix: () => apiClient.get(`${BASE_PATH}/matrix`),

  // ========================================
  // ROLE PERMISSION MANAGEMENT
  // ========================================

  // Update all permissions for a role
  updateRolePermissions: (role, permissionCodes) => 
    apiClient.put(`${BASE_PATH}/roles/${role}`, { role, permissionCodes }),

  // Add permission to role
  addPermissionToRole: (role, permissionCode) => 
    apiClient.post(`${BASE_PATH}/roles/${role}/permissions/${permissionCode}`),

  // Remove permission from role
  removePermissionFromRole: (role, permissionCode) => 
    apiClient.delete(`${BASE_PATH}/roles/${role}/permissions/${permissionCode}`),

  // ========================================
  // PERMISSION CHECK ENDPOINTS
  // ========================================

  // Check if role has permission
  hasPermission: (role, permissionCode) => 
    apiClient.get(`${BASE_PATH}/roles/${role}/has-permission/${permissionCode}`),

  // Get permission codes for role
  getPermissionCodes: (role) => 
    apiClient.get(`${BASE_PATH}/roles/${role}/permission-codes`),
};

