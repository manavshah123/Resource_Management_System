import apiClient from './axiosConfig';

export const userApi = {
  // Get all users with pagination
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);
    if (params.sort) queryParams.append('sort', params.sort);
    return apiClient.get(`/users?${queryParams.toString()}`);
  },

  // Get all users list (no pagination)
  getAllList: () => apiClient.get('/users/all'),

  // Get user by ID
  getById: (id) => apiClient.get(`/users/${id}`),

  // Create new user
  create: (data) => apiClient.post('/users', data),

  // Update user
  update: (id, data) => apiClient.put(`/users/${id}`, data),

  // Delete user
  delete: (id) => apiClient.delete(`/users/${id}`),

  // Toggle user status
  toggleStatus: (id) => apiClient.patch(`/users/${id}/toggle-status`),

  // Assign roles to user
  assignRoles: (id, roles) => apiClient.patch(`/users/${id}/roles`, roles),

  // Get user statistics
  getStats: () => apiClient.get('/users/stats'),

  // Roles & Permissions
  getRoles: () => apiClient.get('/users/roles'),

  getRolePermissions: (role) => apiClient.get(`/users/roles/${role}/permissions`),

  assignPermissionsToRole: (role, permissions) => 
    apiClient.put(`/users/roles/${role}/permissions`, permissions),

  getAllRolePermissions: () => apiClient.get('/users/roles/permissions'),

  // Permissions
  getPermissions: () => apiClient.get('/users/permissions'),

  getPermissionsByModule: () => apiClient.get('/users/permissions/by-module'),

  // Current user
  getMyPermissions: () => apiClient.get('/users/me/permissions'),
};

