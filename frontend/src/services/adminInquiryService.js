import api from './api.js';

function normalizeInquiryList(responseData) {
  const inquiries = responseData?.inquiries || responseData?.data?.inquiries || [];
  const total = Number(responseData?.totalInquiries || responseData?.data?.totalInquiries || inquiries.length);

  return {
    inquiries,
    pagination: {
      currentPage: Number(responseData?.currentPage || responseData?.data?.currentPage || 1),
      totalPages: Number(responseData?.totalPages || responseData?.data?.totalPages || 1),
      totalProducts: total
    }
  };
}

export async function fetchAdminInquiries(params = {}) {
  const response = await api.get('/inquiries', { params });
  return normalizeInquiryList(response.data);
}

export async function updateAdminInquiryStatus(id, status) {
  const response = await api.patch(`/inquiries/${id}/status`, { status });
  return response.data?.inquiry || response.data?.data?.inquiry;
}

export async function addAdminInquiryNote(id, message) {
  const response = await api.post(`/inquiries/${id}/notes`, { message });
  return response.data?.note || response.data?.data?.note;
}

export async function resendAdminInquiryNotification(id) {
  const response = await api.post(`/inquiries/${id}/resend-notification`);
  return response.data;
}

export async function exportAdminInquiriesCsv(params = {}) {
  const response = await api.get('/inquiries/export.csv', {
    params,
    responseType: 'blob'
  });

  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'kelvin-inquiries.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
