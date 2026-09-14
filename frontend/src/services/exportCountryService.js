import api from './api.js';

export async function fetchExportCountries() {
  const response = await api.get('/export-countries');
  return response.data?.countries || [];
}

export async function fetchAdminExportCountries(params = {}) {
  const response = await api.get('/admin/export-countries', { params });
  return response.data?.countries || [];
}

export async function createAdminExportCountry(payload) {
  const response = await api.post('/admin/export-countries', payload);
  return response.data?.country;
}

export async function updateAdminExportCountry(id, payload) {
  const response = await api.put(`/admin/export-countries/${id}`, payload);
  return response.data?.country;
}

export async function deleteAdminExportCountry(id) {
  const response = await api.delete(`/admin/export-countries/${id}`);
  return response.data;
}
