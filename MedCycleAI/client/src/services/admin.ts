import { apiRequest } from '@/lib/queryClient';

export const adminService = {
  async getSystemStats() {
    const response = await apiRequest('GET', '/api/admin/stats');
    return await response.json();
  },

  async getPendingUsers() {
    const response = await apiRequest('GET', '/api/admin/pending-users');
    return await response.json();
  },

  async getAllUsers() {
    const response = await apiRequest('GET', '/api/admin/users');
    return await response.json();
  },

  async approveUser(userId: string) {
    const response = await apiRequest('POST', `/api/admin/users/${userId}/approve`);
    return await response.json();
  },

  async rejectUser(userId: string) {
    const response = await apiRequest('POST', `/api/admin/users/${userId}/reject`);
    return await response.json();
  },

  async getPendingMedicines() {
    const response = await apiRequest('GET', '/api/admin/pending-medicines');
    return await response.json();
  },

  async getAllMedicines() {
    const response = await apiRequest('GET', '/api/admin/medicines');
    return await response.json();
  },

  async approveMedicine(medicineId: string) {
    const response = await apiRequest('POST', `/api/admin/medicines/${medicineId}/approve`);
    return await response.json();
  },

  async rejectMedicine(medicineId: string) {
    const response = await apiRequest('POST', `/api/admin/medicines/${medicineId}/reject`);
    return await response.json();
  }
};
