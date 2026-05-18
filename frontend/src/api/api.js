import axios from 'axios';

const API = axios.create({
  baseURL: 'https://bigdataathleteperformacedashboard.onrender.com',
});

// Attach token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── AUTH ──────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout'),
  forgotPassword: (data) => API.post('/auth/forgot', data),
  resetPassword: (data) => API.post('/auth/reset', data),
  verifyEmail: (token) => API.get(`/auth/verify?token=${token}`),
  googleSignup: (token) => API.post('/auth/google/signup', { token }),
  googleLogin: (token) => API.post('/auth/google/login', { token }),
};

// ── USER ──────────────────────────────────────────────────────
export const userAPI = {
  logBiometrics: (data) =>
    API.post('/user/biometrics', data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
    }),
  uploadBiometricsCSV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return API.post('/user/biometrics/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
  },
  getBiometrics: () =>
    API.get('/user/get_biometrics', {
      headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
    }),
};

// ── ADMIN ─────────────────────────────────────────────────────
export const adminAPI = {
  getAllUsers: () => API.get('/admin/users'),
  manageUser: (data) => API.put('/admin/manage', data),
  searchUsers: (text) => API.get(`/admin/search?text=${encodeURIComponent(text)}`),
  getUserPerformance: (email) => API.get(`/admin/user-performance/${encodeURIComponent(email)}`),
  deleteUser: (data) => API.delete('/admin/delete', { data }),
  createUser: (data) => API.post('/admin/create-user', data),
};

export default API;
