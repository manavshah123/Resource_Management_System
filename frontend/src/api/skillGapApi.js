import apiClient from './axiosConfig';

export const skillGapApi = {
  // Get skill gap analysis for all projects
  getAllProjectGaps: () => {
    return apiClient.get('/skill-gaps');
  },

  // Get skill gap analysis for a specific project
  getProjectGap: (projectId) => {
    return apiClient.get(`/skill-gaps/project/${projectId}`);
  },

  // Get team skill matrix for a project
  getTeamGapMatrix: (projectId) => {
    return apiClient.get(`/skill-gaps/project/${projectId}/matrix`);
  },

  // Get organization-wide skill gap summary
  getSummary: () => {
    return apiClient.get('/skill-gaps/summary');
  },

  // Get skill heatmap data
  getHeatmap: () => {
    return apiClient.get('/skill-gaps/heatmap');
  },

  // Get training recommendations
  getRecommendations: () => {
    return apiClient.get('/skill-gaps/recommendations');
  },
};


