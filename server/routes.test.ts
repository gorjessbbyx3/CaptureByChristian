import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from './routes';
import { storage } from './storage';

// Mock the storage module
vi.mock('./storage', () => ({
  storage: {
    getClients: vi.fn(),
    createClient: vi.fn(),
    getClient: vi.fn(),
    getClientByEmail: vi.fn(),
    getServices: vi.fn(),
    getActiveServices: vi.fn(),
    createService: vi.fn(),
    updateService: vi.fn(),
    deleteService: vi.fn(),
    getBookings: vi.fn(),
    createBooking: vi.fn(),
    getBooking: vi.fn(),
    updateBooking: vi.fn(),
    getBookingsByDateRange: vi.fn(),
    getGalleryImages: vi.fn(),
    createGalleryImage: vi.fn(),
    deleteGalleryImage: vi.fn(),
    updateGalleryImage: vi.fn(),
    getFeaturedImages: vi.fn(),
    getImagesByBooking: vi.fn(),
    getAiChat: vi.fn(),
    createAiChat: vi.fn(),
    updateAiChat: vi.fn(),
    getBookingStats: vi.fn(),
    getMonthlyRevenue: vi.fn(),
    getInvoice: vi.fn(),
    createInvoice: vi.fn(),
    getContracts: vi.fn(),
    createContract: vi.fn(),
    getContract: vi.fn(),
    updateContract: vi.fn(),
    sendContractToPortal: vi.fn(),
    getContactMessages: vi.fn(),
    createContactMessage: vi.fn(),
    updateContactMessage: vi.fn(),
    deleteContactMessage: vi.fn(),
    getClientPortalSessions: vi.fn(),
    getClientPortalStats: vi.fn(),
    getInvoiceStats: vi.fn(),
    getBusinessKPIs: vi.fn(),
    getClientMetrics: vi.fn(),
    getClientMessages: vi.fn(),
    createClientMessage: vi.fn(),
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  }
}));

// Mock the database initializer
vi.mock('./database-init', () => ({
  getDatabaseInitializer: vi.fn(() => ({
    getInitializationStatus: vi.fn().mockReturnValue(true),
    testConnection: vi.fn().mockResolvedValue(true),
  }))
}));

// Mock the openai module
vi.mock('./openai', () => ({
  generateBookingResponse: vi.fn(),
  analyzeImage: vi.fn(),
}));

// Mock the pdf-generator module
vi.mock('./pdf-generator', () => ({
  generateInvoiceHTML: vi.fn(),
  emailInvoice: vi.fn(),
}));

// Mock the twilio module
vi.mock('./twilio', () => ({
  sendMagicLinkSMS: vi.fn(),
  isTwilioConfigured: vi.fn().mockReturnValue(false),
}));

describe('API Routes', () => {
  let app: express.Express;
  let server: any;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
    
    // Reset all mocks
    vi.clearAllMocks();
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'healthy',
        timestamp: expect.any(String),
        service: 'CapturedCCollective',
        database_initialized: true
      });
    });
  });

  describe('Profile Management', () => {
    it('should get profile successfully', async () => {
      const mockProfile = {
        id: 1,
        name: 'Test User',
        title: 'Test Title',
        bio: 'Test bio',
        phone: '123-456-7890',
        email: 'test@example.com',
        address: 'Test Address',
        headshot: null,
        socialMedia: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      vi.mocked(storage.getProfile).mockResolvedValue(mockProfile);

      const response = await request(app).get('/api/profile');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProfile);
    });

    it('should return default profile when none exists', async () => {
      vi.mocked(storage.getProfile).mockResolvedValue(null);

      const response = await request(app).get('/api/profile');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Christian Picaso');
      expect(response.body).toHaveProperty('email', 'christian@picaso.photography');
    });

    it('should update profile successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        title: 'Updated Title',
        bio: 'Updated bio',
        phone: '987-654-3210',
        email: 'updated@example.com',
        address: 'Updated Address',
        headshot: null,
        socialMedia: null,
        isActive: true
      };
      
      const updatedProfile = { 
        id: 1, 
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      vi.mocked(storage.updateProfile).mockResolvedValue(updatedProfile);

      const response = await request(app)
        .put('/api/profile')
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedProfile);
      expect(storage.updateProfile).toHaveBeenCalledWith(updateData);
    });

    it('should handle profile update errors', async () => {
      vi.mocked(storage.updateProfile).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/api/profile')
        .send({ name: 'Test', title: 'Test', bio: 'Test', phone: '123', email: 'test@test.com', address: 'Test', isActive: true });
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to update profile' });
    });
  });

  describe('File Upload', () => {
    it('should handle file upload successfully', async () => {
      const mockFile = {
        fieldname: 'images',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test image data'),
        size: 1024
      };

      const mockImage = {
        id: 1,
        filename: 'test.jpg',
        url: 'data:image/jpeg;base64,test',
        category: 'portfolio'
      };

      vi.mocked(storage.createGalleryImage).mockResolvedValue(mockImage);

      const response = await request(app)
        .post('/api/gallery/upload')
        .attach('images', Buffer.from('test image data'), 'test.jpg')
        .field('category', 'portfolio');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('images');
    });

    it('should handle invalid file type', async () => {
      const response = await request(app)
        .post('/api/gallery/upload')
        .attach('images', Buffer.from('test data'), 'test.txt')
        .field('category', 'portfolio');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Client Management', () => {
    it('should get all clients', async () => {
      const mockClients = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
      ];
      
      vi.mocked(storage.getClients).mockResolvedValue(mockClients);

      const response = await request(app).get('/api/clients');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockClients);
    });

    it('should create a new client', async () => {
      const clientData = {
        name: 'New Client',
        email: 'new@example.com',
        phone: '123-456-7890'
      };
      
      const mockClient = { id: 1, ...clientData };
      vi.mocked(storage.createClient).mockResolvedValue(mockClient);

      const response = await request(app)
        .post('/api/clients')
        .send(clientData);
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockClient);
    });
  });

  describe('Service Management', () => {
    it('should get active services', async () => {
      const mockServices = [
        { id: 1, name: 'Wedding Photography', price: 2500, active: true },
        { id: 2, name: 'Portrait Session', price: 500, active: true }
      ];
      
      vi.mocked(storage.getActiveServices).mockResolvedValue(mockServices);

      const response = await request(app).get('/api/services');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockServices);
    });

    it('should create a new service', async () => {
      const serviceData = {
        name: 'New Service',
        price: 1000,
        duration: 120,
        description: 'Test service'
      };
      
      const mockService = { id: 1, ...serviceData };
      vi.mocked(storage.createService).mockResolvedValue(mockService);

      const response = await request(app)
        .post('/api/services')
        .send(serviceData);
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockService);
    });

    it('should update a service', async () => {
      const updateData = { name: 'Updated Service', price: 1500 };
      const mockService = { id: 1, ...updateData };
      
      vi.mocked(storage.updateService).mockResolvedValue(mockService);

      const response = await request(app)
        .patch('/api/services/1')
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockService);
    });
  });

  describe('Booking Management', () => {
    it('should get all bookings', async () => {
      const mockBookings = [
        { id: 1, clientId: 1, serviceId: 1, date: '2024-01-15', status: 'pending' },
        { id: 2, clientId: 2, serviceId: 2, date: '2024-01-20', status: 'confirmed' }
      ];
      
      vi.mocked(storage.getBookings).mockResolvedValue(mockBookings);

      const response = await request(app).get('/api/bookings');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBookings);
    });

    it('should create a new booking', async () => {
      const bookingData = {
        serviceId: 1,
        date: '2024-01-25',
        location: 'Honolulu',
        totalPrice: '1000',
        clientName: 'Test Client',
        clientEmail: 'test@example.com'
      };
      
      const mockBooking = { id: 1, ...bookingData };
      const mockClient = { id: 1, name: 'Test Client', email: 'test@example.com' };
      
      vi.mocked(storage.getClientByEmail).mockResolvedValue(null);
      vi.mocked(storage.createClient).mockResolvedValue(mockClient);
      vi.mocked(storage.createBooking).mockResolvedValue(mockBooking);

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData);
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBooking);
    });
  });

  describe('Gallery Management', () => {
    it('should get gallery images', async () => {
      const mockImages = [
        { id: 1, url: 'image1.jpg', category: 'portfolio' },
        { id: 2, url: 'image2.jpg', category: 'portfolio' }
      ];
      
      vi.mocked(storage.getGalleryImages).mockResolvedValue(mockImages);

      const response = await request(app).get('/api/gallery');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockImages);
    });

    it('should create gallery image', async () => {
      const imageData = {
        url: 'new-image.jpg',
        category: 'portfolio',
        featured: false
      };
      
      const mockImage = { id: 1, ...imageData };
      vi.mocked(storage.createGalleryImage).mockResolvedValue(mockImage);

      const response = await request(app)
        .post
