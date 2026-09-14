import api from './api.js';

export async function fetchSeoSummary() {
  const response = await api.get('/admin/seo/summary');
  return {
    summary: response.data?.summary || [],
    totals: response.data?.totals || { total: 0, optimized: 0, missing: 0 }
  };
}

export async function fetchSeoRecords(params = {}) {
  const response = await api.get('/admin/seo', { params });

  return {
    records: response.data?.records || [],
    pagination: {
      currentPage: Number(response.data?.currentPage || 1),
      totalPages: Number(response.data?.totalPages || 1),
      totalProducts: Number(response.data?.totalRecords || 0)
    }
  };
}

export async function updateSeoRecord(type, id, payload) {
  const response = await api.put(`/admin/seo/${type}/${id}`, payload);
  return response.data?.record;
}
