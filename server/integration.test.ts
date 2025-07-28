import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from './routes';

// Mock all external dependencies
vi.mock('./storage', () => ({
  storage: {
    getClients: vi.fn().mockResolvedValue([]),
    createClient: vi.fn().mockResolvedValue({ id: 1, name: 'Test', email: 'test@example.com' }),
    getClient: vi.fn().mockResolvedValue({ id: 1, name: 'Test', email: 'test@example.com' }),
    getClientByEmail: vi.fn().mockResolvedValue({ id: 1, name: 'Test', email: 'test@example.com' }),
    updateClient: vi.fn().mockResolvedValue({ id: 1, name: 'Updated', email: 'test@example.com' }),
    
    getServices: vi.fn().mockResolvedValue([]),
    getActiveServices: vi.fn().mockResolvedValue([]),
    createService: vi.fn().mockResolvedValue({ id: 1, name: 'Test Service', price: '100.00' }),
    updateService: vi.fn().mockResolvedValue({ id: 1, name: 'Updated Service', price: '150.00' }),
    deleteService: vi.fn().mockResolvedValue(undefined),
    getService: vi.fn().mockResolvedValue({ id: 1, name: 'Test Service', duration: 120 }),
    
    getBookings: vi.fn().mockResolvedValue([]),
    createBooking: vi.fn().mockResolvedValue({ id: 1, status: 'pending' }),
    getBooking: vi.fn().mockResolvedValue({ id: 1, status: 'pending' }),
    updateBooking: vi.fn().mockResolvedValue({ id: 1, status: 'confirmed' }),
    getBookingsByDateRange: vi.fn().mockResolvedValue([]),
    
    getGalleryImages: vi.fn().mockResolvedValue([]),
    getFeaturedImages: vi.fn().mockResolvedValue([]),
    createGalleryImage: vi.fn().mockResolvedValue({ id: 1, filename: 'test.jpg' }),
    updateGalleryImage: vi.fn().mockResolvedValue({ id: 1, featured: true }),
    deleteGalleryImage: vi.fn().mockResolvedValue(undefined),
    getImagesByBooking: vi.fn().mockResolvedValue([]),
    
    getContracts: vi.fn().mockResolvedValue([]),
    createContract: vi.fn().mockResolvedValue({ id: 1, status: 'draft' }),
    getContract: vi.fn().mockResolvedValue({ id: 1, status: 'draft' }),
    updateContract: vi.fn().mockResolvedValue({ id: 1, status: 'sent' }),
    sendContractToPortal: vi.fn().mockResolvedValue({ success: true, portalLink: 'https://example.com' }),
    
    getInvoice: vi.fn().mockResolvedValue({ id: 1, amount: '100.00' }),
    createInvoice: vi.fn().mockResolvedValue({ id: 1, amount: '100.00' }),
    
    getContactMessages: vi.fn().mockResolvedValue([]),
    createContactMessage: vi.fn().mockResolvedValue({ id: 1, status: 'unread' }),
    updateContactMessage: vi.fn().mockResolvedValue({ id: 1, status: 'read' }),
    deleteContactMessage: vi.fn().mockResolvedValue(undefined),
    
    getAiChat: vi.fn().mockResolvedValue({ id: 1, sessionId: 'test', messages: [] }),
    createAiChat: vi.fn().mockResolvedValue({ id: 1, sessionId: 'test', messages: [] }),
    updateAiChat: vi.fn().mockResolvedValue({ id: 1, sessionId: 'test', messages: [] }),
    
    getBookingStats: vi.fn().mockResolvedValue({ totalBookings: 10, pendingBookings: 2 }),
    getMonthlyRevenue: vi.fn().mockResolvedValue(5000),
    getBusinessKPIs: vi.fn().mockResolvedValue({ totalClients: 50 }),
    getClientMetrics: vi.fn().mockResolvedValue({ totalClients: 50 }),
    getInvoiceStats: vi.fn().mockResolvedValue({ totalRevenue: 10000 }),
    
    getProfile: vi.fn().mockResolvedValue({ id: 1, name: 'Christian Picaso' }),
    updateProfile: vi.fn().mockResolvedValue({ id: 1, name: 'Updated Name' }),
    
    getClientMessages: vi.fn().mockResolvedValue([]),
    createClientMessage: vi.fn().mockResolvedValue({ id: 1, message: 'Test message' }),
    
    getClientPortalSessions: vi.fn().mockResolvedValue([]),
    getClientPortalStats: vi.fn().mockResolvedValue({ activeUsers: 5 })
  }
}));

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

describe('Backend Integration Tests', () => {
  let app: express.Express;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    await registerRoutes(app);
    vi.clearAllMocks();
  });

  describe('System Health', () => {
    it('GET /api/health - should return system health status', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('service', 'CapturedCCollective');
      expect(response.body).toHaveProperty('database_initialized', true);
    });

    it('GET /api/admin/database-status - should return database status', async () => {
      const response = await request(app).get('/api/admin/database-status');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('database');
    });
  });

  describe('Client Management', () => {
    it('GET /api/clients - should retrieve all clients', async () => {
      const response = await request(app).get('/api/clients');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('POST /api/clients - should create new client', async () => {
      const clientData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890'
      };

      const response = await request(app)
        .post('/api/clients')
        .send(clientData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });

    it('GET /api/clients/:id - should retrieve specific client', async () => {
      const response = await request(app).get('/api/clients/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
    });
  });

  describe('Service Management', () => {
    it('GET /api/services - should retrieve active services', async () => {
      const response = await request(app).get('/api/services');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('POST /api/services - should create new service', async () => {
      const serviceData = {
        name: 'Wedding Photography',
        description: 'Full wedding coverage',
        price: '2500.00',
        duration: 480,
        category: 'wedding'
      };

      const response = await request(app)
        .post('/api/services')
        .send(serviceData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });

    it('PATCH /api/services/:id - should update service', async () => {
      const updates = { price: '3000.00' };

      const response = await request(app)
        .patch('/api/services/1')
        .send(updates);
      
      expect(response.status).toBe(200);
    });

    it('DELETE /api/services/:id - should delete service', async () => {
      const response = await request(app).delete('/api/services/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Booking Management', () => {
    it('GET /api/bookings - should retrieve all bookings', async () => {
      const response = await request(app).get('/api/bookings');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('POST /api/bookings - should create new booking', async () => {
      const bookingData = {
        serviceId: 1,
        date: '2024-06-15',
        location: 'Honolulu Beach',
        totalPrice: '1500',
        clientName: 'Jane Smith',
        clientEmail: 'jane@example.com'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });

    it('GET /api/availability - should check calendar availability', async () => {
      const response = await request(app)
        .get('/api/availability')
        .query({ start: '2024-06-01', end: '2024-06-30' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('bookings');
    });
  });

  describe('Gallery Management', () => {
    it('GET /api/gallery - should retrieve gallery images', async () => {
      const response = await request(app).get('/api/gallery');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /api/gallery?featured=true - should retrieve featured images', async () => {
      const response = await request(app).get('/api/gallery?featured=true');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('POST /api/gallery - should create gallery image', async () => {
      const imageData = {
        url: 'https://example.com/image.jpg',
        category: 'wedding',
        featured: false
      };

      const response = await request(app)
        .post('/api/gallery')
        .send(imageData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });

    it('DELETE /api/gallery/:id - should delete gallery image', async () => {
      const response = await request(app).delete('/api/gallery/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Image deleted successfully');
    });
  });

  describe('Contract Management', () => {
    it('GET /api/contracts - should retrieve all contracts', async () => {
      const response = await request(app).get('/api/contracts');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('POST /api/contracts - should create new contract', async () => {
      const contractData = {
        clientId: 1,
        contractType: 'individual',
        title: 'Wedding Photography Contract',
        templateContent: 'Contract content...'
      };

      const response = await request(app)
        .post('/api/contracts')
        .send(contractData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });

    it('POST /api/contracts/:id/send - should send contract to portal', async () => {
      const response = await request(app).post('/api/contracts/1/send');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Invoice Management', () => {
    it('GET /api/invoices - should retrieve all invoices', async () => {
      const response = await request(app).get('/api/invoices');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('POST /api/invoices - should create invoice from booking', async () => {
      const response = await request(app)
        .post('/api/invoices')
        .send({ bookingId: 1 });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });

    it('GET /api/invoices/stats - should get invoice statistics', async () => {
      const response = await request(app).get('/api/invoices/stats');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalRevenue');
    });
  });

  describe('Analytics', () => {
    it('GET /api/analytics/stats - should get booking statistics', async () => {
      const response = await request(app).get('/api/analytics/stats');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalBookings');
    });

    it('GET /api/analytics/revenue/2024/6 - should get monthly revenue', async () => {
      const response = await request(app).get('/api/analytics/revenue/2024/6');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('revenue');
    });

    it('GET /api/analytics/business-kpis - should get business KPIs', async () => {
      const response = await request(app).get('/api/analytics/business-kpis');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalClients');
    });

    it('GET /api/analytics/realtime - should get real-time analytics', async () => {
      const response = await request(app).get('/api/analytics/realtime');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('activeVisitors');
    });
  });

  describe('Contact Messages', () => {
    it('GET /api/contact-messages - should retrieve contact messages', async () => {
      const response = await request(app).get('/api/contact-messages');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('POST /api/contact - should create contact message', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Wedding Inquiry',
        message: 'I would like to book a wedding photographer...'
      };

      const response = await request(app)
        .post('/api/contact')
        .send(contactData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });

    it('PATCH /api/contact-messages/:id - should update contact message', async () => {
      const response = await request(app)
        .patch('/api/contact-messages/1')
        .send({ status: 'read' });
      
      expect(response.status).toBe(200);
    });
  });

  describe('AI Chat', () => {
    it('POST /api/ai-chat - should process AI chat message', async () => {
      const response = await request(app)
        .post('/api/ai-chat')
        .send({
          sessionId: 'test-session',
          message: 'I want to book a wedding photographer',
          clientEmail: 'client@example.com'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('POST /api/replit-ai-chat - should process Replit AI chat', async () => {
      const response = await request(app)
        .post('/api/replit-ai-chat')
        .send({
          sessionId: 'test-session',
          message: 'Help with contract terms',
          agent: 'photography-business-consultant'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('response');
    });
  });

  describe('Profile Management', () => {
    it('GET /api/profile - should get profile', async () => {
      const response = await request(app).get('/api/profile');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name');
    });

    it('PUT /api/profile - should update profile', async () => {
      const updates = {
        name: 'Updated Name',
        bio: 'Updated bio'
      };

      const response = await request(app)
        .put('/api/profile')
        .send(updates);
      
      expect(response.status).toBe(200);
    });
  });

  describe('Client Portal', () => {
    it('POST /api/client-portal/login - should authenticate client', async () => {
      const response = await request(app)
        .post('/api/client-portal/login')
        .send({ email: 'test@example.com' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('GET /api/client-portal/bookings - should get client bookings', async () => {
      const response = await request(app)
        .get('/api/client-portal/bookings')
        .query({ clientId: 1 });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /api/client-portal/galleries - should get client galleries', async () => {
      const response = await request(app)
        .get('/api/client-portal/galleries')
        .query({ clientId: 1 });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Admin Functions', () => {
    it('GET /api/admin/client-credentials - should get client credentials', async () => {
      const response = await request(app).get('/api/admin/client-credentials');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('POST /api/admin/send-welcome-emails - should send welcome emails', async () => {
      const response = await request(app).post('/api/admin/send-welcome-emails');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('GET /api/admin/client-portal-stats - should get portal statistics', async () => {
      const response = await request(app).get('/api/admin/client-portal-stats');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('activeUsers');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent endpoints', async () => {
      const response = await request(app).get('/api/non-existent');
      
      expect(response.status).toBe(404);
    });

    it('should handle missing required parameters', async () => {
      const response = await request(app).get('/api/availability');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Start and end dates are required');
    });

    it('should handle invalid client ID', async () => {
      const response = await request(app).get('/api/clients/999');
      
      expect(response.status).toBe(404);
    });
  });

  describe('Automation Workflows', () => {
    it('GET /api/automation-sequences - should get automation workflows', async () => {
      const response = await request(app).get('/api/automation-sequences');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('POST /api/automation-sequences - should create automation workflow', async () => {
      const workflowData = {
        name: 'Test Workflow',
        trigger: 'booking_confirmed',
        steps: [],
        active: true
      };

      const response = await request(app)
        .post('/api/automation-sequences')
        .send(workflowData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Test Workflow');
    });
  });

  describe('AI Categorization', () => {
    it('POST /api/ai/categorize-contact - should categorize contact message', async () => {
      const response = await request(app)
        .post('/api/ai/categorize-contact')
        .send({
          subject: 'Wedding Photography',
          message: 'I need a wedding photographer'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('category');
      expect(response.body).toHaveProperty('suggestedResponse');
    });
  });
});
