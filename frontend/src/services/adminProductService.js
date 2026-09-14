import api from './api.js';

function normalizeProductList(responseData) {
  return {
    products: responseData?.products || responseData?.data?.products || [],
    pagination: {
      currentPage: Number(responseData?.currentPage || responseData?.data?.currentPage || 1),
      totalPages: Number(responseData?.totalPages || responseData?.data?.totalPages || 1),
      totalProducts: Number(responseData?.totalProducts || responseData?.data?.totalProducts || 0)
    }
  };
}

export async function fetchAdminProducts(params = {}) {
  const response = await api.get('/admin/products', { params });
  return normalizeProductList(response.data);
}

export async function createAdminProduct(payload) {
  const response = await api.post('/admin/products', payload, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data?.product || response.data?.data?.product;
}

export async function updateAdminProduct(id, payload) {
  const response = await api.put(`/admin/products/${id}`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data?.product || response.data?.data?.product;
}

export async function deleteAdminProduct(id) {
  const response = await api.delete(`/admin/products/${id}`);
  return response.data;
}

export async function restoreAdminProduct(id) {
  const response = await api.post(`/admin/products/${id}/restore`);
  return response.data?.product;
}

export async function duplicateAdminProduct(id) {
  const response = await api.post(`/admin/products/${id}/duplicate`);
  return response.data?.product;
}

export async function permanentlyDeleteAdminProduct(id) {
  const response = await api.delete(`/admin/products/${id}/permanent`);
  return response.data;
}

export async function bulkUpdateAdminProducts(payload) {
  const response = await api.patch('/admin/products/bulk', payload);
  return response.data;
}

export async function fetchAdminCategories(params = {}) {
  const response = await api.get('/admin/categories', { params });
  return response.data?.categories || response.data?.data?.categories || [];
}
