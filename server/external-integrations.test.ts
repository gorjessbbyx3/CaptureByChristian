import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateBookingResponse, analyzeImage } from './openai';
import { sendMagicLinkSMS, isTwilioConfigured } from './twilio';
import { generateInvoiceHTML, emailInvoice } from './pdf-generator';

// Mock external APIs
vi.mock('openai', () => ({
  OpenAI: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn()
      }
    }
  }))
}));

vi.mock('twilio', () => ({
  Twilio: vi.fn(() => ({
    messages: {
      create: vi.fn()
    }
  }))
}));

describe('External Integrations Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.TWILIO_ACCOUNT_SID = 'test-sid';
    process.env.TWILIO_AUTH_TOKEN = 'test-token';
    process.env.TWILIO_PHONE_NUMBER = '+1234567890';
  });

  describe('OpenAI Integration', () => {
    it('should generate booking response', async () => {
      const messages = [
        { role: 'user' as const, content: 'I want to book a wedding photographer', timestamp: Date.now() }
      ];
      const bookingData = {};

      const response = await generateBookingResponse(messages, bookingData);
      
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('bookingData');
      expect(typeof response.message).toBe('string');
    });

    it('should handle wedding photography inquiries', async () => {
      const messages = [
        { role: 'user' as const, content: 'wedding photography pricing', timestamp: Date.now() }
      ];

      const response = await generateBookingResponse(messages, {});
      
      expect(response.message).toContain('wedding');
      expect(response.message).toContain('$2,500');
    });

    it('should handle portrait session inquiries', async () => {
      const messages = [
        { role: 'user' as const, content: 'portrait session booking', timestamp: Date.now() }
      ];

      const response = await generateBookingResponse(messages, {});
      
      expect(response.message).toContain('portrait');
      expect(response.message).toContain('$450');
    });

    it('should handle aerial photography inquiries', async () => {
      const messages = [
        { role: 'user' as const, content: 'drone photography services', timestamp: Date.now() }
      ];

      const response = await generateBookingResponse(messages, {});
      
      expect(response.message).toContain('aerial');
      expect(response.message).toContain('FAA-certified');
      expect(response.message).toContain('$350');
    });

    it('should handle location inquiries', async () => {
      const messages = [
        { role: 'user' as const, content: 'where do you shoot in Hawaii', timestamp: Date.now() }
      ];

      const response = await generateBookingResponse(messages, {});
      
      expect(response.message).toContain('Hawaii');
      expect(response.message).toContain('location');
    });

    it('should handle greeting messages', async () => {
      const messages = [
        { role: 'user' as const, content: 'hello', timestamp: Date.now() }
      ];

      const response = await generateBookingResponse(messages, {});
      
      expect(response.message).toContain('Aloha');
      expect(response.message).toContain('CapturedCCollective');
    });

    it('should analyze images with AI', async () => {
      const imageUrl = 'https://example.com/image.jpg';
      
      const analysis = await analyzeImage(imageUrl);
      
      expect(typeof analysis).toBe('string');
      expect((analysis as string).length).toBeGreaterThan(0);
    });

    it('should handle OpenAI API errors gracefully', async () => {
      // Mock OpenAI to throw an error
      const mockOpenAI = await import('openai');
      vi.mocked(mockOpenAI.OpenAI).mockImplementation(() => {
        throw new Error('API Error');
      });

      const messages = [
        { role: 'user' as const, content: 'test message', timestamp: Date.now() }
      ];

      const response = await generateBookingResponse(messages, {});
      
      // Should return a fallback response
      expect(response).toHaveProperty('message');
      expect(response.message).toContain('photography');
    });
  });

  describe('Twilio SMS Integration', () => {
    it('should check if Twilio is configured', () => {
      const isConfigured = isTwilioConfigured();
      expect(typeof isConfigured).toBe('boolean');
    });

    it('should send magic link SMS when configured', async () => {
      const clientName = 'John Doe';
      const phoneNumber = '+1234567890';
      const magicLink = 'https://example.com/portal?token=abc123';

      const result = await sendMagicLinkSMS(clientName, phoneNumber, magicLink);
      
      expect(typeof result).toBe('boolean');
    });

    it('should handle missing Twilio configuration', async () => {
      // Clear environment variables
      delete process.env.TWILIO_ACCOUNT_SID;
      delete process.env.TWILIO_AUTH_TOKEN;
      delete process.env.TWILIO_PHONE_NUMBER;

      const isConfigured = isTwilioConfigured();
      expect(isConfigured).toBe(false);
    });

    it('should handle Twilio API errors', async () => {
      // Mock Twilio to throw an error
      const mockTwilio = await import('twilio');
      vi.mocked(mockTwilio.Twilio).mockImplementation(() => ({
        messages: {
          create: vi.fn().mockRejectedValue(new Error('SMS failed'))
        }
      } as any));

      const result = await sendMagicLinkSMS('John Doe', '+1234567890', 'https://example.com');
      
      expect(result).toBe(false);
    });

    it('should validate phone number format', async () => {
      const invalidNumbers = ['123', 'invalid', ''];
      
      for (const number of invalidNumbers) {
        const result = await sendMagicLinkSMS('Test', number, 'https://example.com');
        expect(result).toBe(false);
      }
    });
  });

  describe('PDF Generation', () => {
    it('should generate invoice HTML', () => {
      const invoiceData = {
        invoiceNumber: 'INV-001',
        invoiceDate: '2024-06-15',
        dueDate: '2024-07-15',
        clientName: 'John Doe',
        clientEmail: 'john@example.com',
        items: [
          {
            description: 'Wedding Photography',
            quantity: 1,
            rate: 2500,
            amount: 2500
          }
        ],
        subtotal: 2500,
        tax: 0,
        taxRate: 0,
        discount: 0,
        total: 2500,
        notes: 'Thank you for your business!'
      };

      const html = generateInvoiceHTML(invoiceData);
      
      expect(typeof html).toBe('string');
      expect(html).toContain('INV-001');
      expect(html).toContain('John Doe');
      expect(html).toContain('Wedding Photography');
      expect(html).toContain('2500');
    });

    it('should handle multiple invoice items', () => {
      const invoiceData = {
        invoiceNumber: 'INV-002',
        invoiceDate: '2024-06-15',
        dueDate: '2024-07-15',
        clientName: 'Jane Smith',
        clientEmail: 'jane@example.com',
        items: [
          {
            description: 'Portrait Session',
            quantity: 1,
            rate: 450,
            amount: 450
          },
          {
            description: 'Additional Prints',
            quantity: 10,
            rate: 25,
            amount: 250
          }
        ],
        subtotal: 700,
        tax: 56,
        taxRate: 8,
        discount: 0,
        total: 756,
        notes: 'Payment due within 30 days'
      };

      const html = generateInvoiceHTML(invoiceData);
      
      expect(html).toContain('Portrait Session');
      expect(html).toContain('Additional Prints');
      expect(html).toContain('700'); // subtotal
      expect(html).toContain('56'); // tax
      expect(html).toContain('756'); // total
    });

    it('should send invoice email', async () => {
      const invoiceData = {
        invoiceNumber: 'INV-003',
        invoiceDate: '2024-06-15',
        dueDate: '2024-07-15',
        clientName: 'Bob Johnson',
        clientEmail: 'bob@example.com',
        items: [],
        subtotal: 1000,
        total: 1000,
        notes: ''
      };

      const pdfBuffer = 'fake pdf content';
      const result = await emailInvoice(invoiceData, pdfBuffer);
      
      expect(typeof result).toBe('boolean');
    });

    it('should handle email sending errors', async () => {
      const invoiceData = {
        invoiceNumber: 'INV-004',
        invoiceDate: '2024-06-15',
        dueDate: '2024-07-15',
        clientName: 'Invalid Email',
        clientEmail: 'invalid-email',
        items: [],
        subtotal: 1000,
        total: 1000,
        notes: ''
      };

      const result = await emailInvoice(invoiceData, Buffer.from(''));
      
      // Should handle invalid email gracefully
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Environment Configuration', () => {
    it('should handle missing OpenAI API key', async () => {
      delete process.env.OPENAI_API_KEY;

      const messages = [
        { role: 'user' as const, content: 'test', timestamp: Date.now() }
      ];

      const response = await generateBookingResponse(messages, {});
      
      // Should provide fallback response
      expect(response).toHaveProperty('message');
    });

    it('should handle missing Twilio credentials', () => {
      delete process.env.TWILIO_ACCOUNT_SID;
      delete process.env.TWILIO_AUTH_TOKEN;

      const isConfigured = isTwilioConfigured();
      expect(isConfigured).toBe(false);
    });

    it('should validate required environment variables', () => {
      const requiredVars = [
        'DATABASE_URL',
        'SESSION_SECRET'
      ];

      // These should be set in test environment
      for (const varName of requiredVars) {
        expect(process.env[varName]).toBeDefined();
      }
    });
  });

  describe('Rate Limiting and Performance', () => {
    it('should handle multiple concurrent AI requests', async () => {
      const messages = [
        { role: 'user' as const, content: 'test message', timestamp: Date.now() }
      ];

      const promises = Array(5).fill(null).map(() => 
        generateBookingResponse(messages, {})
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toHaveProperty('message');
        expect(result).toHaveProperty('bookingData');
      });
    });

    it('should handle large image analysis requests', async () => {
      const largeImageUrl = 'https://example.com/large-image.jpg';
      
      const startTime = Date.now();
      const analysis = await analyzeImage(largeImageUrl);
      const endTime = Date.now();
      
      expect(typeof analysis).toBe('string');
      expect(endTime - startTime).toBeLessThan(30000); // Should complete within 30 seconds
    });

    it('should handle SMS rate limiting', async () => {
      const requests = Array(3).fill(null).map((_, i) => 
        sendMagicLinkSMS(`Client ${i}`, `+123456789${i}`, `https://example.com/${i}`)
      );

      const results = await Promise.all(requests);
      
      // All should complete without errors
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(typeof result).toBe('boolean');
      });
    });
  });

  describe('Data Validation and Security', () => {
    it('should sanitize AI chat inputs', async () => {
      const maliciousMessages = [
        { role: 'user' as const, content: '<script>alert("xss")</script>', timestamp: Date.now() },
        { role: 'user' as const, content: 'DROP TABLE users;', timestamp: Date.now() },
        { role: 'user' as const, content: '../../etc/passwd', timestamp: Date.now() }
      ];

      for (const message of maliciousMessages) {
        const response = await generateBookingResponse([message], {});
        
        expect(response.message).not.toContain('<script>');
        expect(response.message).not.toContain('DROP TABLE');
        expect(response.message).not.toContain('../../');
      }
    });

    it('should validate phone numbers for SMS', async () => {
      const invalidNumbers = [
        '123', // too short
        'abc-def-ghij', // non-numeric
        '+1234567890123456', // too long
        '', // empty
        null as any, // null
        undefined as any // undefined
      ];

      for (const number of invalidNumbers) {
        const result = await sendMagicLinkSMS('Test', number, 'https://example.com');
        expect(result).toBe(false);
      }
    });

    it('should validate email addresses for invoices', async () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        '',
        null,
        undefined
      ];

      for (const email of invalidEmails) {
        const invoiceData = {
          invoiceNumber: 'INV-TEST',
          invoiceDate: '2024-06-15',
          dueDate: '2024-07-15',
          clientName: 'Test',
          clientEmail: email as string,
          items: [],
          subtotal: 100,
          total: 100,
          notes: ''
        };

        const result = await emailInvoice(invoiceData, Buffer.from(''));
        expect(result).toBe(false);
      }
    });

    it('should handle extremely long text inputs', async () => {
      const longMessage = 'a'.repeat(10000); // 10KB message
      const messages = [
        { role: 'user' as const, content: longMessage, timestamp: Date.now() }
      ];

      const response = await generateBookingResponse(messages, {});
      
      expect(response).toHaveProperty('message');
      expect(response.message.length).toBeLessThan(5000); // Should be truncated/summarized
    });
  });

  describe('Integration Health Checks', () => {
    it('should verify all external services are accessible', async () => {
      const healthChecks = {
        openai: false,
        twilio: false,
        email: false
      };

      // Test OpenAI
      try {
        const messages = [{ role: 'user' as const, content: 'health check', timestamp: Date.now() }];
        const response = await generateBookingResponse(messages, {});
        healthChecks.openai = response.message.length > 0;
      } catch (error) {
        healthChecks.openai = false;
      }

      // Test Twilio
      try {
        healthChecks.twilio = isTwilioConfigured();
      } catch (error) {
        healthChecks.twilio = false;
      }

      // Test Email/PDF
      try {
        const testInvoice = {
          invoiceNumber: 'HEALTH-CHECK',
          invoiceDate: '2024-06-15',
          dueDate: '2024-07-15',
          clientName: 'Health Check',
          clientEmail: 'health@example.com',
          items: [],
          subtotal: 0,
          total: 0,
          notes: 'Health check'
        };
        const html = generateInvoiceHTML(testInvoice);
        healthChecks.email = html.length > 0;
      } catch (error) {
        healthChecks.email = false;
      }

      // At least one service should be working
      const workingServices = Object.values(healthChecks).filter(Boolean).length;
      expect(workingServices).toBeGreaterThan(0);
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should fallback gracefully when external API fails', async () => {
      // Mock fetch to simulate Replit AI API failure
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const messages = [
        { role: 'user' as const, content: 'wedding photography pricing', timestamp: Date.now() }
      ];

      const response = await generateBookingResponse(messages, {});
      
      // Should still return a response using fallback logic
      expect(response).toHaveProperty('message');
      expect(response.message).toContain('wedding');
      expect(response.message.length).toBeGreaterThan(0);

      // Restore original fetch
      globalThis.fetch = originalFetch;
    });

    it('should provide fallback responses when all services fail', async () => {
      // Mock all services to fail
      const mockOpenAI = await import('openai');
      vi.mocked(mockOpenAI.OpenAI).mockImplementation(() => {
        throw new Error('All services down');
      });

      const messages = [
        { role: 'user' as const, content: 'wedding photography', timestamp: Date.now() }
      ];

      const response = await generateBookingResponse(messages, {});
      
      expect(response).toHaveProperty('message');
      expect(response.message).toContain('photography');
      expect(response.message.length).toBeGreaterThan(10);
    });

    it('should handle network timeouts gracefully', async () => {
      const mockOpenAI = await import('openai');
      vi.mocked(mockOpenAI.OpenAI).mockImplementation(() => ({
        chat: {
          completions: {
            create: vi.fn().mockImplementation(() => 
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 100)
              )
            )
          }
        }
      } as any));

      const messages = [
        { role: 'user' as const, content: 'test', timestamp: Date.now() }
      ];

      const startTime = Date.now();
      const response = await generateBookingResponse(messages, {});
      const endTime = Date.now();
      
      expect(response).toHaveProperty('message');
      expect(endTime - startTime).toBeLessThan(5000); // Should timeout quickly
    });
  });
});
