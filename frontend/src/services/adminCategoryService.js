import api from './api.js';

function normalizeCategories(responseData) {
  return responseData?.categories || responseData?.data?.categories || [];
}

export async function fetchAdminCategories(params = {}) {
  const response = await api.get('/admin/categories', { params });
  return normalizeCategories(response.data);
}

export async function createAdminCategory(payload) {
  const response = await api.post('/admin/categories', payload);
  return response.data?.category || response.data?.data?.category;
}

export async function updateAdminCategory(id, payload) {
  const response = await api.put(`/admin/categories/${id}`, payload);
  return response.data?.category || response.data?.data?.category;
}

export async function deleteAdminCategory(id) {
  const response = await api.delete(`/admin/categories/${id}`);
  return response.data;
}

export async function restoreAdminCategory(id) {
  const response = await api.post(`/admin/categories/${id}/restore`);
  return response.data?.category || response.data?.data?.category;
}

export async function permanentlyDeleteAdminCategory(id) {
  const response = await api.delete(`/admin/categories/${id}/permanent`);
  return response.data;
}
