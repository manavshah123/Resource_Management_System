import apiClient from './axiosConfig';

export const authApi = {
  // Login
  login: (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },

  // Register (Admin only)
  register: (userData) => {
    return apiClient.post('/auth/register', userData);
  },

  // Logout
  logout: () => {
    return apiClient.post('/auth/logout');
  },

  // Refresh token
  refreshToken: (refreshToken) => {
    return apiClient.post('/auth/refresh', { refreshToken });
  },

  // Get current user
  getCurrentUser: () => {
    return apiClient.get('/auth/me');
  },

  // Update profile
  updateProfile: (profileData) => {
    return apiClient.put('/auth/profile', profileData);
  },

  // Change password
  changePassword: (passwordData) => {
    return apiClient.put('/auth/change-password', passwordData);
  },

  // Forgot password
  forgotPassword: (email) => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: (token, newPassword) => {
    return apiClient.post('/auth/reset-password', { token, newPassword });
  },

  // Verify email
  verifyEmail: (token) => {
    return apiClient.post('/auth/verify-email', { token });
  },
};

