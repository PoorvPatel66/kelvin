import api from './api.js';

function payload(response) {
  return response.data?.data || response.data || {};
}

function downloadBlob(response, filename, type) {
  const url = window.URL.createObjectURL(new Blob([response.data], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function fetchVariants(params = {}) {
  const data = payload(await api.get('/admin/product-variants', { params }));
  return {
    variants: data.variants || [],
    pagination: {
      currentPage: Number(data.currentPage || 1),
      totalPages: Number(data.totalPages || 1),
      totalVariants: Number(data.totalVariants || 0)
    }
  };
}

export async function createVariant(data) {
  return payload(await api.post('/admin/product-variants', data)).variant;
}

export async function updateVariant(id, data) {
  return payload(await api.put(`/admin/product-variants/${id}`, data)).variant;
}

export async function deleteVariant(id) {
  return payload(await api.delete(`/admin/product-variants/${id}`));
}

export async function fetchCatalogs(params = {}) {
  const data = payload(await api.get('/admin/catalogs', { params }));
  return { catalogs: data.catalogs || [], totalCatalogs: Number(data.totalCatalogs || 0) };
}

export async function createCatalog(data) {
  return payload(await api.post('/admin/catalogs', data)).catalog;
}

export async function updateCatalog(id, data) {
  return payload(await api.put(`/admin/catalogs/${id}`, data)).catalog;
}

export async function deleteCatalog(id) {
  return payload(await api.delete(`/admin/catalogs/${id}`));
}

export async function fetchQuotations(params = {}) {
  const data = payload(await api.get('/admin/quotations', { params }));
  return {
    quotations: data.quotations || [],
    pagination: {
      currentPage: Number(data.currentPage || 1),
      totalPages: Number(data.totalPages || 1),
      totalQuotations: Number(data.totalQuotations || 0)
    }
  };
}

export async function createQuotation(data) {
  return payload(await api.post('/admin/quotations', data)).quotation;
}

export async function updateQuotation(id, data) {
  return payload(await api.put(`/admin/quotations/${id}`, data)).quotation;
}

export async function updateQuotationStatus(id, status) {
  return payload(await api.patch(`/admin/quotations/${id}/status`, { status })).quotation;
}

export async function deleteQuotation(id) {
  return payload(await api.delete(`/admin/quotations/${id}`));
}

export async function downloadQuotationPdf(quotation) {
  const response = await api.get(`/admin/quotations/${quotation.id}/pdf`, { responseType: 'blob' });
  downloadBlob(response, `${quotation.quotationNumber}.pdf`, 'application/pdf');
}

export async function fetchAdminUsers(params = {}) {
  const data = payload(await api.get('/admin/users', { params }));
  return { users: data.users || [], roles: data.roles || [], totalUsers: Number(data.totalUsers || 0) };
}

export async function createAdminUser(data) {
  return payload(await api.post('/admin/users', data)).user;
}

export async function updateAdminUser(id, data) {
  return payload(await api.put(`/admin/users/${id}`, data)).user;
}

export async function deactivateAdminUser(id) {
  return payload(await api.delete(`/admin/users/${id}`)).user;
}

export async function fetchNotifications(params = {}) {
  const data = payload(await api.get('/admin/notifications', { params }));
  return {
    notifications: data.notifications || [],
    unreadCount: Number(data.unreadCount || 0),
    pagination: {
      currentPage: Number(data.currentPage || 1),
      totalPages: Number(data.totalPages || 1),
      totalNotifications: Number(data.totalNotifications || 0)
    }
  };
}

export async function markNotificationRead(id) {
  return payload(await api.patch(`/admin/notifications/${id}/read`)).notification;
}

export async function markAllNotificationsRead() {
  return payload(await api.patch('/admin/notifications/read-all'));
}

export async function deleteNotification(id) {
  return payload(await api.delete(`/admin/notifications/${id}`));
}

export async function fetchActivityLogs(params = {}) {
  const data = payload(await api.get('/admin/activity', { params }));
  return {
    logs: data.logs || [],
    pagination: {
      currentPage: Number(data.currentPage || 1),
      totalPages: Number(data.totalPages || 1),
      totalLogs: Number(data.totalLogs || 0)
    }
  };
}

export async function fetchAnalytics(params = {}) {
  return payload(await api.get('/admin/analytics', { params })).analytics || {};
}

export async function fetchBackups() {
  return payload(await api.get('/admin/backups')).backups || [];
}

export async function createBackup(label) {
  return payload(await api.post('/admin/backups', { label })).backup;
}

export async function deleteBackup(id) {
  return payload(await api.delete(`/admin/backups/${id}`));
}

export async function downloadBackup(backup) {
  const response = await api.get(`/admin/backups/${backup.id}/download`, { responseType: 'blob' });
  downloadBlob(response, `kelvin-backup-${backup.id}.json`, 'application/json');
}
