import api from './api.js';

export async function submitContactInquiry(payload) {
  const response = await api.post('/inquiries/contact', payload);
  return response.data;
}

export async function submitQuoteInquiry(payload) {
  const response = await api.post('/inquiries/request-quote', payload);
  return response.data;
}

export async function subscribeNewsletter(payload) {
  const response = await api.post('/inquiries/newsletter', payload);
  return response.data;
}
