import api from './api.js';

function getCustomer(response) {
  return response?.data?.customer || response?.data?.data?.customer;
}

export async function fetchAdminCustomers(params = {}) {
  const response = await api.get('/admin/customers', { params });
  const payload = response.data?.data || response.data || {};
  const customers = payload.customers || [];

  return {
    customers,
    pagination: {
      currentPage: Number(payload.currentPage || 1),
      totalPages: Number(payload.totalPages || 1),
      totalProducts: Number(payload.totalCustomers || customers.length)
    }
  };
}

export async function fetchAdminCustomer(id) {
  const response = await api.get(`/admin/customers/${id}`);
  return getCustomer(response);
}

export async function createAdminCustomer(payload) {
  const response = await api.post('/admin/customers', payload);
  return getCustomer(response);
}

export async function updateAdminCustomer(id, payload) {
  const response = await api.put(`/admin/customers/${id}`, payload);
  return getCustomer(response);
}

export async function archiveAdminCustomer(id) {
  const response = await api.delete(`/admin/customers/${id}`);
  return response.data;
}

export async function addAdminCustomerNote(id, message) {
  const response = await api.post(`/admin/customers/${id}/notes`, { message });
  return response.data?.note || response.data?.data?.note;
}

export async function exportAdminCustomersCsv(params = {}) {
  const response = await api.get('/admin/customers/export.csv', { params, responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'kelvin-customers.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
