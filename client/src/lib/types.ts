export interface BookingFormData {
  serviceId: number;
  date: string;
  time: string;
  location: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  notes?: string;
  addOns: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AIResponse {
  message: string;
  bookingData?: {
    serviceType?: string;
    date?: string;
    location?: string;
    budget?: number;
  };
}

export interface GalleryFilter {
  category?: string;
  featured?: boolean;
}

export interface AvailabilitySlot {
  date: string;
  time: string;
  available: boolean;
  duration: number;
}
