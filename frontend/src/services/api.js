import axios from 'axios';

// Normalize base URL so both "/api", "https://app.onrender.com", and "https://app.onrender.com/api" work flawlessly
let rawUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';

if (!rawUrl || typeof rawUrl !== 'string') {
  rawUrl = '/api';
}

// Remove trailing slash
if (rawUrl.endsWith('/')) {
  rawUrl = rawUrl.slice(0, -1);
}

// If it's a full remote URL without /api, append /api
if ((rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) && !rawUrl.endsWith('/api')) {
  rawUrl = `${rawUrl}/api`;
}

const api = axios.create({
  baseURL: rawUrl,
  timeout: 30000, // 30s timeout to allow Render free tier instances to spin up
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login or register
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

export const projectsAPI = {
  list: () => api.get('/projects'),
  create: (data) => api.post('/projects', data),
  get: (id) => api.get(`/projects/${id}`),
  delete: (id) => api.delete(`/projects/${id}`),
};

export const sourcesAPI = {
  list: (projectId) => api.get(`/projects/${projectId}/sources`),
  upload: (projectId, formData) =>
    api.post(`/projects/${projectId}/sources`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  addText: (projectId, data) => api.post(`/projects/${projectId}/sources`, data),
  get: (projectId, sourceId) => api.get(`/projects/${projectId}/sources/${sourceId}`),
  delete: (projectId, sourceId) =>
    api.delete(`/projects/${projectId}/sources/${sourceId}`),
};

export const chatAPI = {
  send: (projectId, message) => api.post(`/projects/${projectId}/chat`, { message }),
  history: (projectId) => api.get(`/projects/${projectId}/chat`),
};

export const synthesisAPI = {
  create: (projectId, data) => api.post(`/projects/${projectId}/synthesize`, data),
  list: (projectId) => api.get(`/projects/${projectId}/synthesis`),
  get: (projectId, reportId) =>
    api.get(`/projects/${projectId}/synthesis/${reportId}`),
};

export const exportAPI = {
  export: (projectId, data) => api.post(`/projects/${projectId}/export`, data),
};

export default api;
