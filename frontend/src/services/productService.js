import api from './api.js';

export async function fetchProducts(params = {}) {
  const response = await api.get('/products', { params });
  return response.data;
}

export async function fetchFeaturedProducts(params = {}) {
  const response = await api.get('/products/featured', { params });
  return response.data;
}

export async function fetchProductBySlug(slug) {
  const response = await api.get(`/products/${slug}`);
  return response.data?.product || response.data?.data;
}
