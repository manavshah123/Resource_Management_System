import apiClient from './axiosConfig';

export const projectApi = {
  // Get all projects with filters and pagination
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);
    if (params.sort) queryParams.append('sort', params.sort);

    return apiClient.get(`/projects?${queryParams.toString()}`);
  },

  // Get project by ID
  getById: (id) => {
    return apiClient.get(`/projects/${id}`);
  },

  // Create project
  create: (projectData) => {
    return apiClient.post('/projects', projectData);
  },

  // Update project
  update: (id, projectData) => {
    return apiClient.put(`/projects/${id}`, projectData);
  },

  // Delete project
  delete: (id) => {
    return apiClient.delete(`/projects/${id}`);
  },

  // Update project status
  updateStatus: (id, status) => {
    return apiClient.patch(`/projects/${id}/status`, { status });
  },

  // Add team member
  addTeamMember: (projectId, employeeId, allocation) => {
    return apiClient.post(`/projects/${projectId}/team`, {
      employeeId,
      allocation,
    });
  },

  // Remove team member
  removeTeamMember: (projectId, employeeId) => {
    return apiClient.delete(`/projects/${projectId}/team/${employeeId}`);
  },

  // Update team member allocation
  updateTeamMemberAllocation: (projectId, employeeId, allocation) => {
    return apiClient.put(`/projects/${projectId}/team/${employeeId}`, {
      allocation,
    });
  },

  // Get project team
  getTeam: (id) => {
    return apiClient.get(`/projects/${id}/team`);
  },

  // Get project timeline
  getTimeline: (id) => {
    return apiClient.get(`/projects/${id}/timeline`);
  },

  // Get project statistics
  getStatistics: () => {
    return apiClient.get('/projects/statistics');
  },

  // Get projects by manager
  getByManager: (managerId) => {
    return apiClient.get(`/projects/by-manager/${managerId}`);
  },

  // Export project report
  exportReport: (id, format = 'pdf') => {
    return apiClient.get(`/projects/${id}/export?format=${format}`, {
      responseType: 'blob',
    });
  },

  // Find matching employees for project
  findMatchingEmployees: (id) => {
    return apiClient.get(`/projects/${id}/matching-employees`);
  },

  // Get all project statuses
  getStatuses: () => {
    return apiClient.get('/projects/statuses');
  },
};

