import apiClient from './axiosConfig';

export const trainingApi = {
  // Get all trainings with filters
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);
    return apiClient.get(`/trainings?${queryParams.toString()}`);
  },

  // Get training by ID
  getById: (id) => apiClient.get(`/trainings/${id}`),

  // Get training with modules
  getWithModules: (id) => apiClient.get(`/trainings/${id}/modules`),

  // Create training
  create: (data) => apiClient.post('/trainings', data),

  // Update training
  update: (id, data) => apiClient.put(`/trainings/${id}`, data),

  // Delete training
  delete: (id) => apiClient.delete(`/trainings/${id}`),

  // Add skill to training
  addSkill: (trainingId, skillId) => 
    apiClient.post(`/trainings/${trainingId}/skills/${skillId}`),

  // ============ Module Management ============

  // Add module to training
  addModule: (trainingId, data) => apiClient.post(`/trainings/${trainingId}/modules`, data),

  // Update module
  updateModule: (moduleId, data) => apiClient.put(`/trainings/modules/${moduleId}`, data),

  // Delete module
  deleteModule: (moduleId) => apiClient.delete(`/trainings/modules/${moduleId}`),

  // ============ Assignment Management ============

  // Assign training to employee
  assign: (trainingId, data) =>
    apiClient.post(`/trainings/${trainingId}/assign`, data),

  // Bulk assign training
  bulkAssign: (trainingId, data) =>
    apiClient.post(`/trainings/${trainingId}/bulk-assign`, data),

  // Get training assignments
  getAssignments: (trainingId) => apiClient.get(`/trainings/${trainingId}/assignments`),

  // Get employee assignments
  getEmployeeAssignments: (employeeId) => 
    apiClient.get(`/trainings/assignments/employee/${employeeId}`),

  // Get assignment with progress details
  getAssignmentDetails: (assignmentId) => 
    apiClient.get(`/trainings/assignments/${assignmentId}/details`),

  // ============ Progress Tracking ============

  // Start a module
  startModule: (assignmentId, moduleId) =>
    apiClient.post(`/trainings/assignments/${assignmentId}/modules/${moduleId}/start`),

  // Complete a module
  completeModule: (assignmentId, moduleId, data) =>
    apiClient.post(`/trainings/assignments/${assignmentId}/modules/${moduleId}/complete`, data),

  // Update progress (legacy)
  updateProgress: (assignmentId, progress, notes) =>
    apiClient.patch(`/trainings/assignments/${assignmentId}/progress`, { progress, notes }),

  // Complete training
  complete: (assignmentId, proofUrl) =>
    apiClient.post(`/trainings/assignments/${assignmentId}/complete`, { proofUrl }),

  // ============ My Trainings ============

  // Get my assigned trainings
  getMyTrainings: () => apiClient.get('/trainings/my'),

  // Get team progress (for managers)
  getTeamProgress: () => apiClient.get('/trainings/team-progress'),

  // Get training stats
  getStats: () => apiClient.get('/trainings/stats'),
};

