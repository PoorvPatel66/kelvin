import api from './api.js';

export async function fetchCertifications() {
  const response = await api.get('/certifications');
  return response.data?.certifications || [];
}

export async function fetchAdminCertifications(params = {}) {
  const response = await api.get('/admin/certifications', { params });
  return response.data?.certifications || [];
}

export async function createAdminCertification(payload) {
  const response = await api.post('/admin/certifications', payload);
  return response.data?.certification;
}

export async function updateAdminCertification(id, payload) {
  const response = await api.put(`/admin/certifications/${id}`, payload);
  return response.data?.certification;
}

export async function deleteAdminCertification(id) {
  const response = await api.delete(`/admin/certifications/${id}`);
  return response.data;
}

export async function uploadCertificationImage(id, file) {
  const data = new FormData();
  data.append('image', file);
  const response = await api.post(`/admin/certificates/${id}/icon`, data);
  return response.data?.certification;
}

export async function deleteCertificationImage(id) {
  const response = await api.delete(`/admin/certificates/${id}/icon`);
  return response.data?.certification;
}
