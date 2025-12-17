import apiClient from './axiosConfig';

export const skillApi = {
  // Get all skills
  getAll: () => {
    return apiClient.get('/skills');
  },

  // Get skill by ID
  getById: (id) => {
    return apiClient.get(`/skills/${id}`);
  },

  // Create skill
  create: (skillData) => {
    return apiClient.post('/skills', skillData);
  },

  // Update skill
  update: (id, skillData) => {
    return apiClient.put(`/skills/${id}`, skillData);
  },

  // Delete skill
  delete: (id) => {
    return apiClient.delete(`/skills/${id}`);
  },

  // Get skill categories
  getCategories: () => {
    return apiClient.get('/skills/categories');
  },

  // Get skills by category
  getByCategory: (category) => {
    return apiClient.get(`/skills/by-category/${category}`);
  },

  // Get skill statistics
  getStatistics: () => {
    return apiClient.get('/skills/statistics');
  },

  // Get most used skills
  getMostUsed: (limit = 10) => {
    return apiClient.get(`/skills/most-used?limit=${limit}`);
  },

  // Bulk create skills
  bulkCreate: (skills) => {
    return apiClient.post('/skills/bulk', { skills });
  },
};

