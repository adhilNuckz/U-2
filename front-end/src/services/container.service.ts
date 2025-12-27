import api from './api';

export const containerService = {
  async createContainer() {
    const response = await api.post('/containers');
    return response.data;
  },

  async getUserContainer() {
    const response = await api.get('/containers');
    return response.data;
  },

  async deleteContainer() {
    const response = await api.delete('/containers');
    return response.data;
  },

  async executeCommand(containerId: string, command: string) {
    const response = await api.post('/containers/execute', {
      containerId,
      command,
    });
    return response.data;
  },
};