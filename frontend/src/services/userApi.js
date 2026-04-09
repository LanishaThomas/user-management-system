import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000
});

export const getUsers = async (params = {}) => {
  const { data } = await api.get('/users', { params });
  return data;
};

export const getRecommendations = async () => {
  const { data } = await api.get('/users/recommendations');
  return data;
};

export const getAnalytics = async () => {
  const { data } = await api.get('/users/analytics');
  return data;
};

export const getUsersPerformance = async (params = {}) => {
  const { data } = await api.get('/users/performance', { params });
  return data;
};

export const getActivityLogs = async (params = {}) => {
  const { data } = await api.get('/users/logs', { params });
  return data;
};

export const exportUsersCsv = async (params = {}) => {
  const response = await api.get('/users/export/csv', { params, responseType: 'blob' });
  return response.data;
};

export const createUser = async (payload) => {
  const { data } = await api.post('/users', payload);
  return data;
};

export const updateUser = async (id, payload) => {
  const { data } = await api.put(`/users/${id}`, payload);
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await api.delete(`/users/${id}`);
  return data;
};

export default api;
