import api from './axiosInstance';

export const getAlerts = (params) => api.get('/alerts', { params });
export const acknowledgeAlert = (id) => api.patch(`/alerts/${id}/acknowledge`);
export const deleteAlert = (id) => api.delete(`/alerts/${id}`);
export const getRules = (params) => api.get('/alerts/rules', { params });
export const createRule = (data) => api.post('/alerts/rules', data);
export const updateRule = (id, data) => api.put(`/alerts/rules/${id}`, data);
export const toggleRule = (id, active) => api.patch(`/alerts/rules/${id}/toggle`, { active });
export const deleteRule = (id) => api.delete(`/alerts/rules/${id}`);
