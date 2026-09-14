import api from './api.js';

export async function fetchAdminSiteSettings() { return (await api.get('/admin/site-settings')).data.settings; }
export async function updateAdminSiteSettings(payload) { return (await api.put('/admin/site-settings', payload)).data.settings; }
export async function fetchAdminNavigation() { return (await api.get('/admin/navigation')).data.items || []; }
export async function createAdminNavigationItem(payload) { return (await api.post('/admin/navigation', payload)).data.item; }
export async function updateAdminNavigationItem(id, payload) { return (await api.put(`/admin/navigation/${id}`, payload)).data.item; }
export async function deleteAdminNavigationItem(id) { return (await api.delete(`/admin/navigation/${id}`)).data; }
