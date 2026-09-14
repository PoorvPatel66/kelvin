import api from './api.js';

export async function fetchPublishedPage(identifier, options = {}) {
  const response = await api.get(`/pages/${encodeURIComponent(identifier)}`, {
    signal: options.signal
  });

  return response.data?.page || response.data?.data?.page || null;
}
