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

export async function requestPasswordReset(email) {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
}

export async function resetPassword(payload) {
  const response = await api.post('/auth/reset-password', payload);
  const token = response.data?.token;

  setStoredToken(token);
  return response.data;
}
