import axios from 'axios';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return '/api';
  }
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || envUrl === 'https://homeserve-backend.onrender.com/api') {
    return 'https://homeserve-backend-ss0m.onrender.com/api';
  }
  return envUrl;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('homeserve_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and we had a token, it might be expired
      const token = localStorage.getItem('homeserve_token');
      if (token && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('homeserve_token');
        localStorage.removeItem('homeserve_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
