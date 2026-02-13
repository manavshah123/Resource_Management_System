import apiClient from './axiosConfig';

export const allocationApi = {
  // Get all allocations with filters
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params.projectId) queryParams.append('projectId', params.projectId);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);

    return apiClient.get(`/allocations?${queryParams.toString()}`);
  },

  // Get allocation by ID
  getById: (id) => {
    return apiClient.get(`/allocations/${id}`);
  },

  // Create allocation
  create: (allocationData) => {
    return apiClient.post('/allocations', allocationData);
  },

  // Update allocation
  update: (id, allocationData) => {
    return apiClient.put(`/allocations/${id}`, allocationData);
  },

  // Delete allocation
  delete: (id) => {
    return apiClient.delete(`/allocations/${id}`);
  },

  // Get allocations by employee
  getByEmployee: (employeeId) => {
    return apiClient.get(`/allocations/by-employee/${employeeId}`);
  },

  // Get allocations by project
  getByProject: (projectId) => {
    return apiClient.get(`/allocations/by-project/${projectId}`);
  },

  // Check employee availability
  checkAvailability: (employeeId, startDate, endDate) => {
    return apiClient.get('/allocations/check-availability', {
      params: { employeeId, startDate, endDate },
    });
  },

  // Get allocation timeline
  getTimeline: (startDate, endDate) => {
    return apiClient.get('/allocations/timeline', {
      params: { startDate, endDate },
    });
  },

  // Get utilization report
  getUtilizationReport: (startDate, endDate) => {
    return apiClient.get('/allocations/utilization', {
      params: { startDate, endDate },
    });
  },

  // Bulk create allocations
  bulkCreate: (allocations) => {
    return apiClient.post('/allocations/bulk', { allocations });
  },

  // Get upcoming deallocations
  getUpcomingDeallocations: (days = 30) => {
    return apiClient.get(`/allocations/upcoming-end?days=${days}`);
  },
};

