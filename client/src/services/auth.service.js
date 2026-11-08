import api from './api';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore server logout errors
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  async getCurrentUser() {
    const res = await api.get('/auth/me');
    return res.data.user;
  },

  async updatePreferences(preferences) {
    const res = await api.put('/auth/preferences', preferences);
    return res.data;
  },
};
