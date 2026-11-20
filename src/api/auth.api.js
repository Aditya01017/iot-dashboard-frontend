import api from './axiosInstance';

const setTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem('token', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

const authApi = {
  login: async ({ email, password }) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, refreshToken, user } = res.data?.data || {};
    setTokens(token, refreshToken);
    return { token, refreshToken, user };
  },

  register: async ({ name, email, password }) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { token, refreshToken, user } = res.data?.data || {};
    setTokens(token, refreshToken);
    return { token, refreshToken, user };
  },

  forgotPassword: async ({ email }) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async ({ token, password }) => {
    const res = await api.put(`/auth/reset-password/${encodeURIComponent(token)}`, { password });
    return res.data;
  },

  refresh: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const res = await api.post('/auth/refresh', { refreshToken });
    const { token, refreshToken: newRefreshToken, user } = res.data?.data || {};
    setTokens(token, newRefreshToken);
    return { token, refreshToken: newRefreshToken, user };
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {

      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.warn('Logout request failed; local credentials were still cleared.', error);
    } finally {
      clearTokens();
    }
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data?.data;
  },

  updateMe: async ({ name }) => {
    const res = await api.put('/auth/me', { name });
    return res.data?.data;
  },
};

export default authApi;

