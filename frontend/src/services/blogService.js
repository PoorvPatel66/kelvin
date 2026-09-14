import api from './api.js';

export async function fetchBlogs(params = {}) {
  const response = await api.get('/blogs', { params });
  return response.data;
}

export async function fetchBlogBySlug(slug) {
  const response = await api.get(`/blogs/${slug}`);
  return response.data?.blog || response.data?.data;
}
