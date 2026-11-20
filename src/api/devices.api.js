import api from './axiosInstance';

export const getDevices = (params) => api.get('/devices', { params });
export const getDevice = (id) => api.get(`/devices/${id}`);
export const getDevicesSummary = () => api.get('/devices/summary');
export const createDevice = (data) => api.post('/devices', data);
export const updateDevice = (id, data) => api.put(`/devices/${id}`, data);
export const updateDeviceStatus = (id, status) => api.patch(`/devices/${id}/status`, { status });
export const deleteDevice = (id) => api.delete(`/devices/${id}`);
