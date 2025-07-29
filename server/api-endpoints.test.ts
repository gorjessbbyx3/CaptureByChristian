import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from './routes';
import { storage } from './storage';

// Mock all external dependencies
vi.mock('./storage');
vi.mock('./database-init', () => ({
  getDatabaseInitializer: vi.fn(() => ({
    getInitializationStatus: vi.fn().mockReturnValue(true),
    testConnection: vi.fn().mockResolvedValue(true),
  }))
}));
vi.mock('./openai', () => ({
  generateBookingResponse: vi.fn().mockResolvedValue({
    message: 'AI response',
    bookingData: {}
  }),
  analyzeImage: vi.fn().mockResolvedValue('AI analysis')
}));
vi.mock('./pdf-generator', () => ({
  generateInvoiceHTML: vi.fn().mockReturnValue('<html>Invoice</html>'),
  emailInvoice: vi.fn().mockResolvedValue(true)
}));
vi.mock('./twilio', () => ({
  sendMagicLinkSMS: vi.fn().mockResolvedValue(true),
  isTwilioConfigured: vi.fn().mockReturnValue(false)
}));

describe('API Endpoints Comprehensive Tests', () => {
  let app: express.Express;
  let server: any;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
    vi.clearAllMocks();
  });

  describe('Health and System Endpoints', () => {
    it('GET /api/health - should return healthy status', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        service: 'CapturedCCollective',
        database_initialized: true
      });
    });

    it('GET /api/admin/database-status - should return database status', async () => {
      const response = await request(app).get('/api/admin/database-status');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('database');
      expect(response.body.database).toHaveProperty('initialized');
      expect(response.body.database).toHaveProperty('connection_healthy');
    });
  });

  describe('Client Management Endpoints', () => {
    const mockClient = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      createdAt: new Date().toISOString()
    };

    it('GET /api/clients - should get all clients', async () => {
      vi.mocked(storage.getClients).mockResolvedValue([mockClient]);

      const response = await request(app).get('/api/clients');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(storage.getClients).toHaveBeenCalled();
    });

    it('POST /api/clients - should create new client', async () => {
      const newClient = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '987-654-3210'
      };
      
      vi.mocked(storage.createClient).mockResolvedValue({ id: 2, ...newClient, createdAt: new Date().toISOString() });

      const response = await request(app)
        .post('/api/clients')
        .send(newClient);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newClient.name);
      expect(storage.createClient).toHaveBeenCalledWith(newClient);
    });

    it('GET /api/clients/:id - should get client by ID', async () => {
      vi.mocked(storage.getClient).mockResolvedValue(mockClient);

      const response = await request(app).get('/api/clients/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockClient);
      expect(storage.getClient).toHaveBeenCalledWith(1);
    });

    it('GET /api/clients/:id - should return 404 for non-existent client', async () => {
      vi.mocked(storage.getClient).mockResolvedValue(undefined);

      const response = await request(app).get('/api/clients/999');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Client not found');
    });

    it('POST /api/clients - should validate client data', async () => {
      const invalidClient = {
        name: '',
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/api/clients')
        .send(invalidClient);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid client data');
    });
  });

  describe('Service Management Endpoints', () => {
    const mockService = {
      id: 1,
      name: 'Wedding Photography',
      description: 'Full wedding coverage',
      price: '2500.00',
      duration: 480,
      category: 'wedding',
      active: true
    };

    it('GET /api/services - should get active services', async () => {
      vi.mocked(storage.getActiveServices).mockResolvedValue([mockService]);

      const response = await request(app).get('/api/services');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(storage.getActiveServices).toHaveBeenCalled();
    });

    it('GET /api/services/admin - should get all services including inactive', async () => {
      vi.mocked(storage.getServices).mockResolvedValue([mockService]);

      const response = await request(app).get('/api/services/admin');
      
      expect(response.status).toBe(200);
      expect(storage.getServices).toHaveBeenCalled();
    });

    it('POST /api/services - should create new service', async () => {
      const newService = {
        name: 'Portrait Session',
        description: 'Individual portrait photography',
        price: '500.00',
        duration: 120,
        category: 'portrait'
      };
      
      vi.mocked(storage.createService).mockResolvedValue({ id: 2, ...newService, active: true });

      const response = await request(app)
        .post('/api/services')
        .send(newService);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(storage.createService).toHaveBeenCalledWith(newService);
    });

    it('PATCH /api/services/:id - should update service', async () => {
      const updates = { price: '3000.00' };
      const updatedService = { ...mockService, ...updates };
      
      vi.mocked(storage.updateService).mockResolvedValue(updatedService);

      const response = await request(app)
        .patch('/api/services/1')
        .send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body.price).toBe('3000.00');
      expect(storage.updateService).toHaveBeenCalledWith(1, updates);
    });

    it('DELETE /api/services/:id - should delete service', async () => {
      vi.mocked(storage.deleteService).mockResolvedValue();

      const response = await request(app).delete('/api/services/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(storage.deleteService).toHaveBeenCalledWith(1);
    });
  });

  describe('Booking Management Endpoints', () => {
    const mockBooking = {
      id: 1,
      clientId: 1,
      serviceId: 1,
      date: '2024-06-15T10:00:00Z',
      duration: 240,
      location: 'Honolulu Beach',
      totalPrice: '1500.00',
      status: 'pending',
      createdAt: new Date().toISOString(),
      client: { id: 1, name: 'John Doe', email: 'john@example.com' },
      service: { id: 1, name: 'Portrait Session', price: '1500.00' }
    };

    it('GET /api/bookings - should get all bookings', async () => {
      vi.mocked(storage.getBookings).mockResolvedValue([mockBooking]);

      const response = await request(app).get('/api/bookings');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(storage.getBookings).toHaveBeenCalled();
    });

    it('POST /api/bookings - should create new booking with new client', async () => {
      const bookingData = {
        serviceId: 1,
        date: '2024-06-25',
        location: 'Waikiki Beach',
        totalPrice: '1000',
        clientName: 'New Client',
        clientEmail: 'new@example.com',
        clientPhone: '555-0123'
      };

      const mockClient = { id: 2, name: 'New Client', email: 'new@example.com' };
      const mockService = { id: 1, duration: 120 };
      
      vi.mocked(storage.getClientByEmail).mockResolvedValue(null);
      vi.mocked(storage.createClient).mockResolvedValue(mockClient);
      vi.mocked(storage.getService).mockResolvedValue(mockService);
      vi.mocked(storage.createBooking).mockResolvedValue({ ...mockBooking, id: 2 });

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData);
      
      expect(response.status).toBe(200);
      expect(storage.createClient).toHaveBeenCalled();
      expect(storage.createBooking).toHaveBeenCalled();
    });

    it('GET /api/bookings/:id - should get booking by ID', async () => {
      vi.mocked(storage.getBooking).mockResolvedValue(mockBooking);

      const response = await request(app).get('/api/bookings/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBooking);
      expect(storage.getBooking).toHaveBeenCalledWith(1);
    });

    it('PATCH /api/bookings/:id - should update booking', async () => {
      const updates = { status: 'confirmed' };
      const updatedBooking = { ...mockBooking, ...updates };
      
      vi.mocked(storage.updateBooking).mockResolvedValue(updatedBooking);

      const response = await request(app)
        .patch('/api/bookings/1')
        .send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('confirmed');
      expect(storage.updateBooking).toHaveBeenCalledWith(1, updates);
    });

    it('GET /api/availability - should get calendar availability', async () => {
      const startDate = '2024-06-01';
      const endDate = '2024-06-30';
      
      vi.mocked(storage.getBookingsByDateRange).mockResolvedValue([mockBooking]);

      const response = await request(app)
        .get('/api/availability')
        .query({ start: startDate, end: endDate });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('bookings');
      expect(Array.isArray(response.body.bookings)).toBe(true);
    });

    it('GET /api/availability - should require start and end dates', async () => {
      const response = await request(app).get('/api/availability');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Start and end dates are required');
    });
  });

  describe('Gallery Management Endpoints', () => {
    const mockImage = {
      id: 1,
      filename: 'wedding-photo-1.jpg',
      originalName: 'IMG_001.jpg',
      url: 'https://example.com/images/wedding-photo-1.jpg',
      category: 'wedding',
      featured: false,
      uploadedAt: new Date().toISOString()
    };

    it('GET /api/gallery - should get all gallery images', async () => {
      vi.mocked(storage.getGalleryImages).mockResolvedValue([mockImage]);

      const response = await request(app).get('/api/gallery');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(storage.getGalleryImages).toHaveBeenCalled();
    });

    it('GET /api/gallery?featured=true - should get featured images', async () => {
      const featuredImage = { ...mockImage, featured: true };
      vi.mocked(storage.getFeaturedImages).mockResolvedValue([featuredImage]);

      const response = await request(app).get('/api/gallery?featured=true');
      
      expect(response.status).toBe(200);
      expect(storage.getFeaturedImages).toHaveBeenCalled();
    });

    it('POST /api/gallery - should create gallery image', async () => {
      const imageData = {
        url: 'new-image.jpg',
        category: 'portfolio',
        featured: false
      };
      
      vi.mocked(storage.createGalleryImage).mockResolvedValue({ id: 2, ...imageData, filename: 'new-image.jpg', originalName: 'new-image.jpg', uploadedAt: new Date().toISOString() });

      const response = await request(app)
        .post('/api/gallery')
        .send(imageData);
      
      expect(response.status).toBe(200);
      expect(storage.createGalleryImage).toHaveBeenCalled();
    });

    it('DELETE /api/gallery/:id - should delete gallery image', async () => {
      vi.mocked(storage.deleteGalleryImage).mockResolvedValue();

      const response = await request(app).delete('/api/gallery/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Image deleted successfully');
      expect(storage.deleteGalleryImage).toHaveBeenCalledWith(1);
    });

    it('PATCH /api/gallery/:id/featured - should update featured status', async () => {
      vi.mocked(storage.updateGalleryImage).mockResolvedValue({ ...mockImage, featured: true });

      const response = await request(app)
        .patch('/api/gallery/1/featured')
        .send({ featured: true });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('featured', true);
      expect(storage.updateGalleryImage).toHaveBeenCalledWith(1, { featured: true });
    });
  });

  describe('Contract Management Endpoints', () => {
    const mockContract = {
      id: 1,
      clientId: 1,
      contractType: 'individual',
      title: 'Wedding Photography Contract',
      status: 'draft',
      createdAt: new Date().toISOString(),
      client: { id: 1, name: 'John Doe', email: 'john@example.com' }
    };

    it('GET /api/contracts - should get all contracts', async () => {
      vi.mocked(storage.getContracts).mockResolvedValue([mockContract]);

      const response = await request(app).get('/api/contracts');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(storage.getContracts).toHaveBeenCalled();
    });

    it('POST /api/contracts - should create new contract', async () => {
      const contractData = {
        clientId: 1,
        contractType: 'individual',
        title: 'New Contract',
        templateContent: 'Contract content...'
      };
      
      vi.mocked(storage.createContract).mockResolvedValue({ id: 2, ...contractData, status: 'draft', createdAt: new Date().toISOString() });

      const response = await request(app)
        .post('/api/contracts')
        .send(contractData);
      
      expect(response.status).toBe(200);
      expect(storage.createContract).toHaveBeenCalled();
    });

    it('GET /api/contracts/:id - should get contract by ID', async () => {
      vi.mocked(storage.getContract).mockResolvedValue(mockContract);

      const response = await request(app).get('/api/contracts/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockContract);
    });

    it('PUT /api/contracts/:id - should update contract', async () => {
      const updates = { status: 'sent' };
      const updatedContract = { ...mockContract, ...updates };
      
      vi.mocked(storage.updateContract).mockResolvedValue(updatedContract);

      const response = await request(app)
        .put('/api/contracts/1')
        .send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('sent');
    });

    it('POST /api/contracts/:id/send - should send contract to portal', async () => {
      vi.mocked(storage.sendContractToPortal).mockResolvedValue({
        success: true,
        portalLink: 'https://example.com/portal/contract/token'
      });

      const response = await request(app).post('/api/contracts/1/send');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('portalLink');
    });
  });

  describe('Invoice Management Endpoints', () => {
    const mockInvoice = {
      id: 1,
      bookingId: 1,
      amount: '1500.00',
      status: 'pending',
      dueDate: new Date().toISOString()
    };

    it('GET /api/invoices - should get all invoices', async () => {
      const mockBookings = [{
        id: 1,
        totalPrice: '1500.00',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        client: { name: 'John Doe', email: 'john@example.com' },
        service: { name: 'Wedding Photography', price: '1500.00' }
      }];
      
      vi.mocked(storage.getBookings).mockResolvedValue(mockBookings);

      const response = await request(app).get('/api/invoices');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('POST /api/invoices - should create invoice from booking', async () => {
      const mockBooking = {
        id: 1,
        totalPrice: '1500.00',
        client: { name: 'John Doe' },
        service: { name: 'Wedding Photography' }
      };
      
      vi.mocked(storage.getBooking).mockResolvedValue(mockBooking);
      vi.mocked(storage.createInvoice).mockResolvedValue(mockInvoice);

      const response = await request(app)
        .post('/api/invoices')
        .send({ bookingId: 1 });
      
      expect(response.status).toBe(200);
      expect(storage.createInvoice).toHaveBeenCalled();
    });

    it('GET /api/invoices/:bookingId - should get invoice by booking ID', async () => {
      vi.mocked(storage.getInvoice).mockResolvedValue(mockInvoice);

      const response = await request(app).get('/api/invoices/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockInvoice);
    });

    it('GET /api/invoices/stats - should get invoice statistics', async () => {
      const mockStats = {
        totalRevenue: 15000,
        pendingAmount: 3000,
        overdueAmount: 500,
        paymentRate: 85
      };
      
      vi.mocked(storage.getInvoiceStats).mockResolvedValue(mockStats);

      const response = await request(app).get('/api/invoices/stats');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStats);
    });
  });

  describe('Analytics Endpoints', () => {
    it('GET /api/analytics/stats - should get booking statistics', async () => {
      const mockStats = {
        totalBookings: 50,
        pendingBookings: 10,
        confirmedBookings: 35,
        monthlyRevenue: 12500
      };
      
      vi.mocked(storage.getBookingStats).mockResolvedValue(mockStats);

      const response = await request(app).get('/api/analytics/stats');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStats);
    });

    it('GET /api/analytics/revenue/:year/:month - should get monthly revenue', async () => {
      vi.mocked(storage.getMonthlyRevenue).mockResolvedValue(8500);

      const response = await request(app).get('/api/analytics/revenue/2024/6');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('revenue', 8500);
      expect(storage.getMonthlyRevenue).toHaveBeenCalledWith(2024, 6);
    });

    it('GET /api/analytics/business-kpis - should get business KPIs', async () => {
      const mockKPIs = {
        monthlyRecurringRevenue: 15000,
        totalClients: 125,
        totalBookings: 200,
        completionRate: 92
      };
      
      vi.mocked(storage.getBusinessKPIs).mockResolvedValue(mockKPIs);

      const response = await request(app).get('/api/analytics/business-kpis');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockKPIs);
    });

    it('GET /api/analytics/clients - should get client metrics', async () => {
      const mockMetrics = {
        totalClients: 125,
        newThisMonth: 15,
        repeatClients: 45,
        avgLifetimeValue: 2500
      };
      
      vi.mocked(storage.getClientMetrics).mockResolvedValue(mockMetrics);

      const response = await request(app).get('/api/analytics/clients');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMetrics);
    });

    it('GET /api/analytics/realtime - should get real-time analytics', async () => {
      vi.mocked(storage.getBookings).mockResolvedValue([]);
      vi.mocked(storage.getClients).mockResolvedValue([]);
      vi.mocked(storage.getContactMessages).mockResolvedValue([]);

      const response = await request(app).get('/api/analytics/realtime');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('activeVisitors');
      expect(response.body).toHaveProperty('newBookings');
      expect(response.body).toHaveProperty('totalClients');
      expect(response.body).toHaveProperty('recentActivity');
    });
  });

  describe('Contact Message Endpoints', () => {
    const mockMessage = {
      id: 1,
      name: 'Jane Smith',
      email: 'jane@example.com',
      subject: 'Wedding Inquiry',
      message: 'I would like to book a wedding photographer...',
      status: 'unread',
      createdAt: new Date().toISOString()
    };

    it('GET /api/contact-messages - should get all contact messages', async () => {
      vi.mocked(storage.getContactMessages).mockResolvedValue([mockMessage]);

      const response = await request(app).get('/api/contact-messages');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('POST /api/contact - should create contact message', async () => {
      const contactData = {
        name: 'New Contact',
        email: 'contact@example.com',
        subject: 'General Inquiry',
        message: 'Hello, I have a question...'
      };
      
      vi.mocked(storage.createContactMessage).mockResolvedValue({ id: 2, ...contactData, status: 'unread', createdAt: new Date().toISOString() });

      const response = await request(app)
        .post('/api/contact')
        .send(contactData);
      
      expect(response.status).toBe(200);
      expect(storage.createContactMessage).toHaveBeenCalled();
    });

    it('PATCH /api/contact-messages/:id - should update contact message', async () => {
      const updates = { status: 'read' };
      const updatedMessage = { ...mockMessage, ...updates };
      
      vi.mocked(storage.updateContactMessage).mockResolvedValue(updatedMessage);

      const response = await request(app)
        .patch('/api/contact-messages/1')
        .send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('read');
    });

    it('DELETE /api/contact-messages/:id - should delete contact message', async () => {
      vi.mocked(storage.deleteContactMessage).mockResolvedValue();

      const response = await request(app).delete('/api/contact-messages/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('AI Chat Endpoints', () => {
    const mockChat = {
      id: 1,
      sessionId: 'session-123',
      messages: [],
      bookingData: {},
      createdAt: new Date().toISOString()
    };

    it('POST /api/ai-chat - should process AI chat message', async () => {
      vi.mocked(storage.getAiChat).mockResolvedValue(mockChat);
      vi.mocked(storage.updateAiChat).mockResolvedValue(mockChat);

      const response = await request(app)
        .post('/api/ai-chat')
        .send({
          sessionId: 'session-123',
          message: 'I want to book a wedding photographer',
          clientEmail: 'client@example.com'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('bookingData');
    });

    it('GET /api/ai-chat/:sessionId - should get chat session', async () => {
      vi.mocked(storage.getAiChat).mockResolvedValue(mockChat);

      const response = await request(app).get('/api/ai-chat/session-123');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockChat);
    });

    it('POST /api/replit-ai-chat - should process Replit AI chat', async () => {
      const response = await request(app)
        .post('/api/replit-ai-chat')
        .send({
          sessionId: 'session-456',
          message: 'Help me with contract terms',
          agent: 'photography-business-consultant'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('response');
      expect(response.body).toHaveProperty('agent');
    });
  });

  describe('Profile Management Endpoints', () => {
    const mockProfile = {
      id: 1,
      name: 'Christian Picaso',
      title: 'Professional Photographer',
      bio: 'Capturing moments...',
      phone: '(808) 555-PHOTO',
      email: 'christian@picaso.photography',
      address: 'Honolulu, Hawaii',
      isActive: true
    };

    it('GET /api/profile - should get profile', async () => {
      vi.mocked(storage.getProfile).mockResolvedValue(mockProfile);

      const response = await request(app).get('/api/profile');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProfile);
    });

    it('GET /api/profile - should return default profile when none exists', async () => {
      vi.mocked(storage.getProfile).mockResolvedValue(undefined);

      const response = await request(app).get('/api/profile');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Christian Picaso');
      expect(response.body).toHaveProperty('email', 'christian@picaso.photography');
    });

    it('PUT /api/profile - should update profile', async () => {
      const updates = {
        name: 'Updated Name',
        bio: 'Updated bio'
      };
      const updatedProfile = { ...mockProfile, ...updates };
      
      vi.mocked(storage.updateProfile).mockResolvedValue(updatedProfile);

      const response = await request(app)
        .put('/api/profile')
        .send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedProfile);
    });
  });

  describe('Client Portal Endpoints', () => {
    const mockClient = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com'
    };

    it('POST /api/client-portal/login - should authenticate client', async () => {
      vi.mocked(storage.getClientByEmail).mockResolvedValue(mockClient);

      const response = await request(app)
        .post('/api/client-portal/login')
        .send({ email: 'john@example.com' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('token');
    });

    it('POST /api/client-portal should work', async () => {
      // Add test implementation here
    });
  });
});
