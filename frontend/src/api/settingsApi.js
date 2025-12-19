import apiClient from './axiosConfig';

const BASE_PATH = '/settings';

export const settingsApi = {
  // ========================================
  // PUBLIC ENDPOINTS (No Auth Required)
  // ========================================
  
  // Get public branding config
  getPublicBranding: () => apiClient.get(`${BASE_PATH}/public/branding`),

  // ========================================
  // SETTINGS ENDPOINTS
  // ========================================

  // Get all settings (Admin only)
  getAllSettings: () => apiClient.get(BASE_PATH),

  // Get settings by category
  getSettingsByCategory: (category) => apiClient.get(`${BASE_PATH}/category/${category}`),

  // ========================================
  // BRANDING ENDPOINTS
  // ========================================

  // Get branding configuration
  getBranding: () => apiClient.get(`${BASE_PATH}/branding`),

  // Update branding configuration
  updateBranding: (config) => apiClient.put(`${BASE_PATH}/branding`, config),

  // ========================================
  // ZOHO ENDPOINTS
  // ========================================

  // Get Zoho configuration
  getZohoConfig: () => apiClient.get(`${BASE_PATH}/zoho`),

  // Update Zoho configuration
  updateZohoConfig: (config) => apiClient.put(`${BASE_PATH}/zoho`, config),

  // ========================================
  // INDIVIDUAL SETTING ENDPOINTS
  // ========================================

  // Update a single setting
  updateSetting: (category, key, value) => 
    apiClient.put(`${BASE_PATH}/${category}/${key}`, { value }),

  // Bulk update settings
  bulkUpdateSettings: (settings) => 
    apiClient.put(`${BASE_PATH}/bulk`, { settings }),
};

