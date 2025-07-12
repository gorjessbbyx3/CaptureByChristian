import { apiRequest } from './queryClient';

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
