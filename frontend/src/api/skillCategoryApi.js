import apiClient from './axiosConfig';

export const skillCategoryApi = {
  // Get all categories
  getAll: () => apiClient.get('/skill-categories'),

  // Get active categories only
  getActive: () => apiClient.get('/skill-categories/active'),

  // Get category by ID
  getById: (id) => apiClient.get(`/skill-categories/${id}`),

  // Get category by code
  getByCode: (code) => apiClient.get(`/skill-categories/code/${code}`),

  // Create new category
  create: (data) => apiClient.post('/skill-categories', data),

  // Update category
  update: (id, data) => apiClient.put(`/skill-categories/${id}`, data),

  // Delete category
  delete: (id) => apiClient.delete(`/skill-categories/${id}`),

  // Toggle category active status
  toggleActive: (id) => apiClient.patch(`/skill-categories/${id}/toggle-active`),
};

