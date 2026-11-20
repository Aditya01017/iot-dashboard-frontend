import api from './axiosInstance';

export const getLatestReadings = (deviceId) => api.get(`/sensors/${deviceId}/latest`);
export const getSensorHistory = (deviceId, params) => api.get(`/sensors/${deviceId}/history`, { params });
export const getSensorTypes = (deviceId) => api.get(`/sensors/${deviceId}/types`);
export const getAggregate = (params) => api.get('/sensors/aggregate', { params });
export const exportSensorData = (params) => api.get('/sensors/export', { params, responseType: 'blob' });
