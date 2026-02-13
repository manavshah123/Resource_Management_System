import apiClient from './axiosConfig';

// Helper to download blob as file
const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const reportApi = {
  // ==================== EMPLOYEE UTILIZATION ====================
  getUtilizationReport: (startDate, endDate) => {
    return apiClient.get('/reports/utilization', {
      params: { startDate, endDate }
    });
  },

  downloadUtilizationPdf: async (startDate, endDate) => {
    const response = await apiClient.get('/reports/utilization/pdf', {
      params: { startDate, endDate },
      responseType: 'blob',
    });
    const today = new Date().toISOString().split('T')[0];
    downloadFile(response.data, `Utilization_Report_${today}.pdf`);
    return response;
  },

  downloadUtilizationExcel: async (startDate, endDate) => {
    const response = await apiClient.get('/reports/utilization/excel', {
      params: { startDate, endDate },
      responseType: 'blob',
    });
    const today = new Date().toISOString().split('T')[0];
    downloadFile(response.data, `Utilization_Report_${today}.xlsx`);
    return response;
  },

  // ==================== BENCH REPORT ====================
  getBenchReport: () => {
    return apiClient.get('/reports/bench');
  },

  downloadBenchPdf: async () => {
    const response = await apiClient.get('/reports/bench/pdf', {
      responseType: 'blob',
    });
    const today = new Date().toISOString().split('T')[0];
    downloadFile(response.data, `Bench_Report_${today}.pdf`);
    return response;
  },

  downloadBenchExcel: async () => {
    const response = await apiClient.get('/reports/bench/excel', {
      responseType: 'blob',
    });
    const today = new Date().toISOString().split('T')[0];
    downloadFile(response.data, `Bench_Report_${today}.xlsx`);
    return response;
  },

  // ==================== SKILL EVOLUTION ====================
  getSkillEvolutionReport: (startDate, endDate) => {
    return apiClient.get('/reports/skill-evolution', {
      params: { startDate, endDate }
    });
  },

  downloadSkillEvolutionExcel: async (startDate, endDate) => {
    const response = await apiClient.get('/reports/skill-evolution/excel', {
      params: { startDate, endDate },
      responseType: 'blob',
    });
    const today = new Date().toISOString().split('T')[0];
    downloadFile(response.data, `Skill_Evolution_${today}.xlsx`);
    return response;
  },

  // ==================== PROJECT NEEDS ====================
  getProjectNeedsReport: () => {
    return apiClient.get('/reports/project-needs');
  },

  downloadProjectNeedsExcel: async () => {
    const response = await apiClient.get('/reports/project-needs/excel', {
      responseType: 'blob',
    });
    const today = new Date().toISOString().split('T')[0];
    downloadFile(response.data, `Project_Needs_${today}.xlsx`);
    return response;
  },

  // ==================== TRAINING PROGRESS ====================
  getTrainingProgressReport: () => {
    return apiClient.get('/reports/training-progress');
  },

  downloadTrainingProgressPdf: async () => {
    const response = await apiClient.get('/reports/training-progress/pdf', {
      responseType: 'blob',
    });
    const today = new Date().toISOString().split('T')[0];
    downloadFile(response.data, `Training_Progress_${today}.pdf`);
    return response;
  },

  downloadTrainingProgressExcel: async () => {
    const response = await apiClient.get('/reports/training-progress/excel', {
      responseType: 'blob',
    });
    const today = new Date().toISOString().split('T')[0];
    downloadFile(response.data, `Training_Progress_${today}.xlsx`);
    return response;
  },

  // ==================== PERFORMANCE ====================
  getPerformanceReport: (startDate, endDate) => {
    return apiClient.get('/reports/performance', {
      params: { startDate, endDate }
    });
  },

  downloadPerformanceExcel: async (startDate, endDate) => {
    const response = await apiClient.get('/reports/performance/excel', {
      params: { startDate, endDate },
      responseType: 'blob',
    });
    const today = new Date().toISOString().split('T')[0];
    downloadFile(response.data, `Performance_Report_${today}.xlsx`);
    return response;
  },

  // ==================== DAILY SUMMARY ====================
  getDailySummaryReport: () => {
    return apiClient.get('/reports/daily-summary');
  },

  downloadDailySummaryPdf: async () => {
    const response = await apiClient.get('/reports/daily-summary/pdf', {
      responseType: 'blob',
    });
    const today = new Date().toISOString().split('T')[0];
    downloadFile(response.data, `Daily_Summary_${today}.pdf`);
    return response;
  },

  // ==================== WEEKLY SUMMARY ====================
  getWeeklySummaryReport: () => {
    return apiClient.get('/reports/weekly-summary');
  },

  downloadWeeklySummaryPdf: async () => {
    const response = await apiClient.get('/reports/weekly-summary/pdf', {
      responseType: 'blob',
    });
    const today = new Date().toISOString().split('T')[0];
    downloadFile(response.data, `Weekly_Summary_${today}.pdf`);
    return response;
  },
};
