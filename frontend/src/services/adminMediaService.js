import api from './api.js';

export async function fetchAdminMediaAssets() {
  const response = await api.get('/admin/assets');
  return response.data?.assets || response.data?.data?.assets || [];
}

export async function uploadAdminMediaAsset(payload) {
  const response = await api.post('/admin/media/upload', payload, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data?.asset || response.data?.data?.asset || response.data;
}

export async function deleteAdminMediaAsset(id) {
  const response = await api.delete(`/admin/assets/${id}`);
  return response.data;
}
