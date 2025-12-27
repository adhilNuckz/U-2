import api from './api';

export const adminService = {
  async getSystemHealth() {
    const response = await api.get('/admin/health');
    return response.data;
  },

  async getAllUsers() {
    const response = await api.get('/admin/users');
    return response.data;
  },

  async forceDeleteContainer(containerId: string) {
    const response = await api.delete(`/admin/containers/${containerId}`);
    return response.data;
  },

  async deleteUser(userId: number) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
};