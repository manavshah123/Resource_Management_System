import apiClient from './axiosConfig';

export const dashboardApi = {
  // Get dashboard summary
  getSummary: () => {
    return apiClient.get('/dashboard/summary');
  },

  // Get resource utilization chart data
  getUtilization: (period = 'month') => {
    return apiClient.get(`/dashboard/utilization?period=${period}`);
  },

  // Get project status distribution
  getProjectStatusDistribution: () => {
    return apiClient.get('/dashboard/project-status-distribution');
  },

  // Get skill distribution
  getSkillDistribution: () => {
    return apiClient.get('/dashboard/skill-distribution');
  },

  // Get department distribution
  getDepartmentDistribution: () => {
    return apiClient.get('/dashboard/department-distribution');
  },

  // Get allocation trends
  getAllocationTrends: (months = 6) => {
    return apiClient.get(`/dashboard/allocation-trends?months=${months}`);
  },

  // Get upcoming deadlines
  getUpcomingDeadlines: (days = 30) => {
    return apiClient.get(`/dashboard/upcoming-deadlines?days=${days}`);
  },

  // Get recent activities
  getRecentActivities: (limit = 10) => {
    return apiClient.get(`/dashboard/recent-activities?limit=${limit}`);
  },

  // Get bench employees
  getBenchEmployees: () => {
    return apiClient.get('/dashboard/bench-employees');
  },

  // Get overallocated employees
  getOverallocatedEmployees: () => {
    return apiClient.get('/dashboard/overallocated-employees');
  },
};

