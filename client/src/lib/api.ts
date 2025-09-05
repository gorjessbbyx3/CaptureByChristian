import { apiRequest } from './queryClient';
import axios from 'axios';

export async function createBooking(bookingData: any) {
  const response = await apiRequest('POST', '/api/bookings', bookingData);
  return response.json();
}

export async function fetchServices() {
  const response = await apiRequest('GET', '/api/services');
  return response.json();
}

export async function fetchBookings() {
  const response = await apiRequest('GET', '/api/bookings');
  return response.json();
}

export async function fetchClients() {
  const response = await apiRequest('GET', '/api/clients');
  return response.json();
}

export async function updateBooking(id: number, data: any) {
  const response = await apiRequest('PATCH', `/api/bookings/${id}`, data);
  return response.json();
}

export async function fetchGalleryImages(featured?: boolean) {
  const url = featured ? '/api/gallery?featured=true' : '/api/gallery';
  const response = await apiRequest('GET', url);
  return response.json();
}

export async function fetchAvailability(start: string, end: string) {
  const response = await apiRequest('GET', `/api/availability?start=${start}&end=${end}`);
  return response.json();
}

export async function sendAIMessage(sessionId: string, message: string, clientEmail?: string) {
  const response = await apiRequest('POST', '/api/ai-chat', {
    sessionId,
    message,
    clientEmail,
  });
  return response.json();
}

export async function fetchAIChat(sessionId: string) {
  const response = await apiRequest('GET', `/api/ai-chat/${sessionId}`);
  return response.json();
}

export async function fetchAnalytics() {
  const response = await apiRequest('GET', '/api/analytics/stats');
  return response.json();
}

// Base API configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin-login';
    }
    return Promise.reject(error);
  }
);