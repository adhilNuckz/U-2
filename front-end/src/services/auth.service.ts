import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post('/auth/login', credentials);
    const { accessToken, user } = response.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    return { accessToken, user };
  },

  async register(credentials: RegisterCredentials) {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
};