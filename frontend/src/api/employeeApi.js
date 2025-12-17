import apiClient from './axiosConfig';

export const employeeApi = {
  // Get all employees with filters and pagination
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.department) queryParams.append('department', params.department);
    if (params.status) queryParams.append('status', params.status);
    if (params.skills?.length) {
      params.skills.forEach((skill) => queryParams.append('skills', skill));
    }
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);
    if (params.sort) queryParams.append('sort', params.sort);

    return apiClient.get(`/employees?${queryParams.toString()}`);
  },

  // Get employee by ID
  getById: (id) => {
    return apiClient.get(`/employees/${id}`);
  },

  // Get comprehensive employee profile
  getProfile: (id) => {
    return apiClient.get(`/employees/${id}/profile`);
  },

  // Update employee max FT
  updateMaxFT: (id, maxFT) => {
    return apiClient.patch(`/employees/${id}/max-ft`, { maxFT });
  },

  // Create employee
  create: (employeeData) => {
    return apiClient.post('/employees', employeeData);
  },

  // Update employee
  update: (id, employeeData) => {
    return apiClient.put(`/employees/${id}`, employeeData);
  },

  // Delete employee
  delete: (id) => {
    return apiClient.delete(`/employees/${id}`);
  },

  // Update employee skills
  updateSkills: (id, skills) => {
    return apiClient.put(`/employees/${id}/skills`, { skills });
  },

  // Get employee allocations
  getAllocations: (id) => {
    return apiClient.get(`/employees/${id}/allocations`);
  },

  // Get available employees for date range
  getAvailable: (startDate, endDate, minAvailability = 50) => {
    return apiClient.get('/employees/available', {
      params: { startDate, endDate, minAvailability },
    });
  },

  // Get all employees with availability info for team member selection
  getAllWithAvailability: () => {
    return apiClient.get('/employees/with-availability');
  },

  // Get employees by skill
  getBySkill: (skillId) => {
    return apiClient.get(`/employees/by-skill/${skillId}`);
  },

  // Get employees by department
  getByDepartment: (department) => {
    return apiClient.get(`/employees/by-department/${department}`);
  },

  // Bulk import employees
  bulkImport: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/employees/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Export employees
  export: (format = 'xlsx', filters = {}) => {
    const queryParams = new URLSearchParams(filters);
    return apiClient.get(`/employees/export?format=${format}&${queryParams.toString()}`, {
      responseType: 'blob',
    });
  },

  // Get employee statistics
  getStatistics: () => {
    return apiClient.get('/employees/statistics');
  },

  // Get bench employees (not allocated to any project)
  getBench: () => {
    return apiClient.get('/employees/bench');
  },

  // Get departments list
  getDepartments: () => {
    return apiClient.get('/employees/departments');
  },

  // Upload employee avatar
  uploadAvatar: (id, file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.post(`/employees/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

