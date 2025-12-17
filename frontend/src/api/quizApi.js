import apiClient from './axiosConfig';

export const quizApi = {
  // Get all quizzes with pagination
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);
    if (params.sort) queryParams.append('sort', params.sort);
    return apiClient.get(`/quizzes?${queryParams.toString()}`);
  },

  // Get published quizzes
  getPublished: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);
    return apiClient.get(`/quizzes/published?${queryParams.toString()}`);
  },

  // Get quiz by ID
  getById: (id) => apiClient.get(`/quizzes/${id}`),

  // Create quiz
  create: (data) => apiClient.post('/quizzes', data),

  // Update quiz
  update: (id, data) => apiClient.put(`/quizzes/${id}`, data),

  // Publish quiz
  publish: (id) => apiClient.post(`/quizzes/${id}/publish`),

  // Delete quiz
  delete: (id) => apiClient.delete(`/quizzes/${id}`),

  // Question management
  addQuestion: (quizId, questionData) => 
    apiClient.post(`/quizzes/${quizId}/questions`, questionData),

  updateQuestion: (quizId, questionId, questionData) => 
    apiClient.put(`/quizzes/${quizId}/questions/${questionId}`, questionData),

  deleteQuestion: (quizId, questionId) => 
    apiClient.delete(`/quizzes/${quizId}/questions/${questionId}`),

  // Assignment
  assign: (quizId, employeeId, dueDate, remarks) =>
    apiClient.post(`/quizzes/${quizId}/assign`, { employeeId, dueDate, remarks }),

  assignMultiple: (quizId, employeeIds, dueDate, remarks) =>
    apiClient.post(`/quizzes/${quizId}/assign-multiple`, { employeeIds, dueDate, remarks }),

  // Get my quiz assignments
  getMyAssignments: () => apiClient.get('/quizzes/my-assignments'),

  // Get quiz assignments (for admin/managers)
  getAssignments: (quizId) => apiClient.get(`/quizzes/${quizId}/assignments`),

  // Quiz taking
  startAttempt: (assignmentId) => 
    apiClient.post(`/quizzes/assignments/${assignmentId}/start`),

  submitAttempt: (attemptId, answers) =>
    apiClient.post(`/quizzes/attempts/${attemptId}/submit`, answers),

  // Statistics
  getStatistics: (quizId) => apiClient.get(`/quizzes/${quizId}/statistics`),
};

