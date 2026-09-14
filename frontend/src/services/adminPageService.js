import api from './api.js';

function normalizePageList(responseData) {
  return {
    pages: responseData?.pages || responseData?.data?.pages || [],
    pagination: {
      currentPage: Number(responseData?.currentPage || responseData?.data?.currentPage || 1),
      totalPages: Number(responseData?.totalPages || responseData?.data?.totalPages || 1),
      totalProducts: Number(responseData?.totalWebsitePages || responseData?.data?.totalWebsitePages || 0)
    }
  };
}

function normalizePage(responseData) {
  return responseData?.page || responseData?.data?.page;
}

export async function fetchAdminPages(params = {}) {
  const response = await api.get('/admin/pages', { params });
  return normalizePageList(response.data);
}

export async function createAdminPage(payload) {
  const response = await api.post('/admin/pages', payload);
  return normalizePage(response.data);
}

export async function updateAdminPage(id, payload) {
  const response = await api.put(`/admin/pages/${id}`, payload);
  return normalizePage(response.data);
}

export async function deleteAdminPage(id) {
  const response = await api.delete(`/admin/pages/${id}`);
  return response.data;
}

export async function publishAdminPage(id) {
  const response = await api.patch(`/admin/pages/${id}/publish`);
  return normalizePage(response.data);
}

export async function draftAdminPage(id) {
  const response = await api.patch(`/admin/pages/${id}/draft`);
  return normalizePage(response.data);
}
