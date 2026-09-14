import api from './api.js';

function normalizeBlogList(responseData) {
  return {
    blogs: responseData?.blogs || responseData?.data?.blogs || [],
    pagination: {
      currentPage: Number(responseData?.currentPage || responseData?.data?.currentPage || 1),
      totalPages: Number(responseData?.totalPages || responseData?.data?.totalPages || 1),
      totalProducts: Number(responseData?.totalBlogs || responseData?.data?.totalBlogs || 0)
    }
  };
}

function normalizeCategories(responseData) {
  return responseData?.categories || responseData?.data?.categories || [];
}

export async function fetchAdminBlogs(params = {}) {
  const response = await api.get('/admin/blogs', { params });
  return normalizeBlogList(response.data);
}

export async function createAdminBlog(payload) {
  const response = await api.post('/admin/blogs', payload);
  return response.data?.blog || response.data?.data?.blog;
}

export async function updateAdminBlog(id, payload) {
  const response = await api.put(`/admin/blogs/${id}`, payload);
  return response.data?.blog || response.data?.data?.blog;
}

export async function deleteAdminBlog(id) {
  const response = await api.delete(`/admin/blogs/${id}`);
  return response.data;
}

export async function restoreAdminBlog(id) {
  const response = await api.post(`/admin/blogs/${id}/restore`);
  return response.data?.blog || response.data?.data?.blog;
}

export async function permanentlyDeleteAdminBlog(id) {
  const response = await api.delete(`/admin/blogs/${id}/permanent`);
  return response.data;
}

export async function publishAdminBlog(id) {
  const response = await api.patch(`/admin/blogs/${id}/publish`);
  return response.data?.blog || response.data?.data?.blog;
}

export async function draftAdminBlog(id) {
  const response = await api.patch(`/admin/blogs/${id}/draft`);
  return response.data?.blog || response.data?.data?.blog;
}

export async function setAdminBlogFeatured(id, featured) {
  const response = await api.patch(`/admin/blogs/${id}/featured`, { featured });
  return response.data?.blog || response.data?.data?.blog;
}

export async function fetchAdminBlogCategories() {
  const response = await api.get('/admin/blogs/meta/categories');
  return normalizeCategories(response.data);
}

export async function createAdminBlogCategory(payload) {
  const response = await api.post('/admin/blogs/meta/categories', payload);
  return response.data?.category || response.data?.data?.category;
}
