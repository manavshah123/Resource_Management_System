import apiClient from './axiosConfig';

export const forecastingApi = {
  // Get capacity forecast
  getCapacityForecast: (days = 90) =>
    apiClient.get(`/forecasting/capacity?days=${days}`),

  // Get current utilization
  getUtilization: () => apiClient.get('/forecasting/utilization'),

  // Get upcoming releases
  getUpcomingReleases: (days = 30) =>
    apiClient.get(`/forecasting/upcoming-releases?days=${days}`),

  // Get resource gaps
  getResourceGaps: () => apiClient.get('/forecasting/resource-gaps'),

  // Get overallocated employees
  getOverallocated: () => apiClient.get('/forecasting/overallocated'),

  // Get underutilized employees
  getUnderutilized: () => apiClient.get('/forecasting/underutilized'),

  // Get department utilization
  getDepartmentUtilization: () => apiClient.get('/forecasting/department-utilization'),

  // Get skill distribution
  getSkillDistribution: () => apiClient.get('/forecasting/skill-distribution'),

  // Get FTE forecast matrix (NEW)
  getFTEMatrix: (months = 12) =>
    apiClient.get(`/forecasting/fte-matrix?months=${months}`),

  // Get revenue forecast (NEW)
  getRevenueForecast: (months = 12) =>
    apiClient.get(`/forecasting/revenue?months=${months}`),

  // Get combined forecast dashboard (NEW)
  getDashboard: (months = 12) =>
    apiClient.get(`/forecasting/dashboard?months=${months}`),
};

