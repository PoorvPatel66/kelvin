import axios from 'axios';

const defaultApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api/v1'
    : '/api/v1');

const api = axios.create({
  baseURL: defaultApiBaseUrl,
  timeout: 15000,
  withCredentials: true
});

export function getStoredToken() {
  return localStorage.getItem('kelvin_admin_token');
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('kelvin_admin_token', token);
    return;
  }

  localStorage.removeItem('kelvin_admin_token');
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setStoredToken(null);
      window.dispatchEvent(new CustomEvent('kelvin:auth-expired'));
    }

    return Promise.reject(error);
  }
);

export default api;
