import apiClient from './axiosConfig';

const BASE_PATH = '/integrations/zoho';

export const zohoApi = {
  // Get integration status
  getStatus: () => apiClient.get(`${BASE_PATH}/status`),

  // Get config status
  getConfig: () => apiClient.get(`${BASE_PATH}/config`),

  // Get OAuth authorization URL
  getAuthUrl: () => apiClient.get(`${BASE_PATH}/auth-url`),

  // Complete OAuth callback
  completeCallback: (code) => apiClient.post(`${BASE_PATH}/callback`, null, { params: { code } }),

  // Disconnect integration
  disconnect: () => apiClient.post(`${BASE_PATH}/disconnect`),

  // Get available portals
  getPortals: () => apiClient.get(`${BASE_PATH}/portals`),

  // Get Zoho projects
  getProjects: () => apiClient.get(`${BASE_PATH}/projects`),

  // Get Zoho users/team members
  getUsers: () => apiClient.get(`${BASE_PATH}/users`),

  // Get Zoho timesheets/timelogs
  getTimesheets: (projectId = null) => 
    apiClient.get(`${BASE_PATH}/timesheets`, { params: projectId ? { projectId } : {} }),

  // Import selected projects
  importProjects: (projectIds, defaultManagerId, updateExisting = false) =>
    apiClient.post(`${BASE_PATH}/projects/import`, {
      projectIds,
      defaultManagerId,
      updateExisting,
    }),

  // Update integration settings
  updateSettings: (integrationId, settings) =>
    apiClient.patch(`${BASE_PATH}/settings/${integrationId}`, settings),
};

export default zohoApi;

