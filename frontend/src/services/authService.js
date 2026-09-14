import api, { setStoredToken } from './api.js';

export async function loginAdmin(credentials) {
  const response = await api.post('/auth/login', credentials);
  const token = response.data?.token;

  setStoredToken(token);

  return response.data;
}

export async function requestOwnerOtp(credentials) {
  const response = await api.post('/auth/owner/request-otp', credentials);
  return response.data;
}

export async function verifyOwnerOtp(credentials) {
  const response = await api.post('/auth/owner/verify-otp', credentials);
  const token = response.data?.token;

  setStoredToken(token);

  return response.data;
}

export async function logoutAdmin() {
  try {
    await api.post('/auth/logout');
  } finally {
    setStoredToken(null);
  }
}

export async function getCurrentAdmin() {
  const response = await api.get('/auth/me');
  return response.data?.user || response.data?.admin || response.data?.data;
}
