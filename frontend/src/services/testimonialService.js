import api from './api.js';

export async function fetchTestimonials(params = {}) {
  const response = await api.get('/testimonials', { params });
  return response.data?.testimonials || [];
}

export async function fetchAdminTestimonials(params = {}) {
  const response = await api.get('/admin/testimonials', { params });
  return response.data?.testimonials || [];
}

export async function createAdminTestimonial(payload) {
  const response = await api.post('/admin/testimonials', payload);
  return response.data?.testimonial;
}

export async function updateAdminTestimonial(id, payload) {
  const response = await api.put(`/admin/testimonials/${id}`, payload);
  return response.data?.testimonial;
}

export async function deleteAdminTestimonial(id) {
  const response = await api.delete(`/admin/testimonials/${id}`);
  return response.data;
}
