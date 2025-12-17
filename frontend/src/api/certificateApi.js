import apiClient from './axiosConfig';

export const certificateApi = {
  // Generate certificate for completed training
  generate: (assignmentId) => apiClient.post(`/certificates/generate/${assignmentId}`),

  // Get certificate by assignment
  getByAssignment: (assignmentId) => apiClient.get(`/certificates/assignment/${assignmentId}`),

  // Verify certificate
  verify: (certificateNumber) => apiClient.get(`/certificates/verify/${certificateNumber}`),

  // Get certificates by employee
  getByEmployee: (employeeId) => apiClient.get(`/certificates/employee/${employeeId}`),

  // Get my certificates
  getMyCertificates: () => apiClient.get('/certificates/my'),

  // Get certificates by training
  getByTraining: (trainingId) => apiClient.get(`/certificates/training/${trainingId}`),

  // Download certificate HTML
  download: (assignmentId) => {
    const token = localStorage.getItem('accessToken');
    const url = `/api/certificates/download/${assignmentId}`;
    
    // Open in new window for printing
    window.open(url, '_blank');
  },

  // Download certificate with fetch
  downloadCertificate: async (assignmentId) => {
    const response = await apiClient.get(`/certificates/download/${assignmentId}`, {
      responseType: 'text'
    });
    
    // Create a new window and write the HTML
    const printWindow = window.open('', '_blank');
    printWindow.document.write(response.data);
    printWindow.document.close();
    
    // Auto print after load
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};

