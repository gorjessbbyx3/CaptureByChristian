import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for high-resolution photography
    files: 10, // Maximum 10 files per upload
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  },
});
import { 
  insertClientSchema, insertBookingSchema, insertServiceSchema,
  insertContractSchema, insertInvoiceSchema, insertGalleryImageSchema,
  insertProductSchema, insertQuestionnaireSchema
} from "@shared/schema.js";
import { z } from "zod";
import { generateBookingResponse, analyzeImage } from "./openai";
import { log } from "./vite";
import { getDatabaseInitializer } from "./database-init";
import { 
  authenticateToken, requireAdmin, verifyPassword, generateToken, 
  initializeAdminUser, type AuthRequest, type JWTPayload 
} from "./auth.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize admin user on startup
  await initializeAdminUser();

  // Authentication routes
  app.post("/api/auth/admin/login", async (req, res) => {
    try {
      const { username, password } = z.object({
        username: z.string().min(1),
        password: z.string().min(1)
      }).parse(req.body);

      // Authenticate using email as username
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.role !== 'admin') {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const payload: JWTPayload = {
        userId: user.id,
        username: user.username,
        role: user.role
      };

      const token = generateToken(payload);

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid request data', details: error.errors });
      } else {
        res.status(500).json({ error: 'Login failed' });
      }
    }
  });

  app.get("/api/auth/admin/verify", authenticateToken, requireAdmin, (req: AuthRequest, res) => {
    res.json({
      success: true,
      user: {
        id: req.user!.id,
        username: req.user!.username,
        email: req.user!.email,
        role: req.user!.role
      }
    });
  });

  app.post("/api/auth/admin/logout", authenticateToken, (_req, res) => {
    // With JWT, logout is handled client-side by removing the token
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // Health check endpoint for Docker
  app.get("/api/health", (_req, res) => {
    const dbInitializer = getDatabaseInitializer();
    res.status(200).json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      service: "CapturedCCollective",
      database_initialized: dbInitializer.getInitializationStatus()
    });
  });

  // Database status endpoint for debugging
  app.get("/api/admin/database-status", authenticateToken, requireAdmin, async (_req, res) => {
    try {
      const dbInitializer = getDatabaseInitializer();
      const isInitialized = dbInitializer.getInitializationStatus();

      // Test current connection
      const connectionTest = await dbInitializer.testConnection();

      res.json({
        success: true,
        database: {
          initialized: isInitialized,
          connection_healthy: connectionTest,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to check database status",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Client routes
  app.get("/api/clients", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ error: "Failed to fetch clients", details: (error as Error).message });
    }
  });

  app.post("/api/clients", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid client data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create client" });
      }
    }
  });

  app.get("/api/clients/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const client = await storage.getClient(parseInt(req.params.id));
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch client" });
    }
  });

  // Public service routes
  app.get("/api/services", async (_req, res) => {
    try {
      const services = await storage.getActiveServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.post("/api/services", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid service data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create service" });
      }
    }
  });

  // Update service
  app.patch('/api/services/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const serviceId = parseInt(req.params.id);
      const updateSchema = insertServiceSchema.partial();
      const validatedData = updateSchema.parse(req.body);

      const updatedService = await storage.updateService(serviceId, validatedData);
      res.json(updatedService);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        res.status(400).json({ error: 'Invalid service data', details: error.errors });
        return;
      }
      log(`Error updating service: ${error}`, "express");
      res.status(500).json({ error: 'Failed to update service' });
    }
  });

  // Delete service
  app.delete('/api/services/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      await storage.deleteService(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      log(`Error deleting service: ${error}`, "express");
      res.status(500).json({ error: 'Failed to delete service' });
    }
  });

  // Get all services (including inactive) for admin
  app.get('/api/services/admin', authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      log(`Error fetching admin services: ${error}`, "express");
      res.status(500).json({ error: 'Failed to fetch services' });
    }
  });

  // Booking routes
  app.get("/api/bookings", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings", details: (error as Error).message });
    }
  });

  // Create a custom booking request schema
  const bookingRequestSchema = z.object({
    serviceId: z.number().or(z.string().transform(val => parseInt(val))),
    date: z.string().transform(val => new Date(val)),
    location: z.string(),
    totalPrice: z.string(),
    clientName: z.string(),
    clientEmail: z.string().email(),
    clientPhone: z.string().optional(),
    notes: z.string().optional(),
    status: z.string().optional(),
    addOns: z.array(z.any()).optional(),
    duration: z.number().optional(),
  });

  app.post("/api/bookings", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const requestData = bookingRequestSchema.parse(req.body);

      // Create or find existing client first
      let client;
      try {
        client = await storage.getClientByEmail(requestData.clientEmail);
      } catch (error) {
        client = null;
      }

      if (!client) {
        client = await storage.createClient({
          name: requestData.clientName,
          email: requestData.clientEmail,
          phone: requestData.clientPhone || null,
          notes: requestData.notes || null,
        });
      }

      // Get service to extract duration
      const service = await storage.getService(requestData.serviceId);
      if (!service) {
        return res.status(400).json({ error: "Invalid service ID" });
      }

      // Check for booking conflicts before creating
      const requestedDate = new Date(requestData.date);
      const sessionDuration = requestData.duration || service.duration || 2;

      const bufferStart = new Date(requestedDate.getTime() - (30 * 60 * 1000));
      const bufferEnd = new Date(requestedDate.getTime() + ((sessionDuration + 1) * 60 * 60 * 1000));

      const conflictingBookings = await storage.getBookingsByDateRange(bufferStart, bufferEnd);
      const activeConflicts = conflictingBookings.filter(booking =>
        booking.status === 'confirmed' || booking.status === 'pending'
      );

      if (activeConflicts.length > 0) {
        const conflict = activeConflicts[0];
        return res.status(409).json({
          error: "Booking conflict detected",
          message: `A ${conflict.service?.name || 'session'} is already scheduled on ${new Date(conflict.date).toLocaleDateString()}. Please choose a different date or time.`,
          conflictingBooking: {
            id: conflict.id,
            date: conflict.date,
            service: conflict.service?.name,
            client: conflict.client?.name,
            status: conflict.status
          },
          suggestedAlternatives: [
            new Date(bufferEnd.getTime() + (60 * 60 * 1000)).toISOString(),
            new Date(requestedDate.getTime() + (24 * 60 * 60 * 1000)).toISOString(),
          ]
        });
      }

      const bookingData = {
        clientId: client.id,
        serviceId: requestData.serviceId,
        date: requestData.date,
        duration: requestData.duration || service.duration,
        location: requestData.location,
        totalPrice: requestData.totalPrice,
        status: requestData.status || "pending",
        notes: requestData.notes || null,
        addOns: requestData.addOns || null,
      };

      const validatedBookingData = insertBookingSchema.parse(bookingData);
      const booking = await storage.createBooking(validatedBookingData);

      res.json(booking);
    } catch (error) {
      console.error("Booking creation error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid booking data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create booking", details: (error as Error).message });
      }
    }
  });

  app.get("/api/bookings/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const booking = await storage.getBooking(parseInt(req.params.id));
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  });

  app.patch("/api/bookings/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const updateData = req.body;
      const booking = await storage.updateBooking(parseInt(req.params.id), updateData);
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to update booking" });
    }
  });

  // Calendar availability route
  app.get("/api/availability", async (req, res) => {
    try {
      const { start, end } = req.query;
      if (!start || !end) {
        return res.status(400).json({ error: "Start and end dates are required" });
      }

      const startDate = new Date(start as string);
      const endDate = new Date(end as string);

      const bookings = await storage.getBookingsByDateRange(startDate, endDate);

      // Return availability data
      res.json({
        bookings: bookings.map(b => ({
          id: b.id,
          date: b.date,
          duration: b.duration,
          service: b.service.name,
          client: b.client.name,
          status: b.status,
        })),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch availability" });
    }
  });

  app.patch("/api/contracts/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const updateData = req.body;
      const contract = await storage.updateContract(parseInt(req.params.id), updateData);
      res.json(contract);
    } catch (error) {
      res.status(500).json({ error: "Failed to update contract" });
    }
  });

  // Gallery routes
  app.get("/api/gallery", async (req, res) => {
    try {
      const { featured } = req.query;
      const images = featured === 'true' 
        ? await storage.getFeaturedImages()
        : await storage.getGalleryImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gallery images" });
    }
  });

  app.post("/api/gallery", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const imageData = insertGalleryImageSchema.parse(req.body);

      // Analyze image with AI if URL provided
      if (imageData.url) {
        try {
          const analysis = await analyzeImage(imageData.url);
          imageData.aiAnalysis = analysis;
        } catch (error) {
          console.error("AI analysis failed:", error);
        }
      }

      const image = await storage.createGalleryImage(imageData);
      res.json(image);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid image data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create gallery image" });
      }
    }
  });

  app.post("/api/gallery/upload", 
    authenticateToken, 
    requireAdmin,
    upload.array('images', 10), 
    async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      // Enhanced file validation for images and videos
      const allowedMimeTypes = [
        // Image formats
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/tiff',
        // Video formats
        'video/mp4', 'video/mov', 'video/avi', 'video/wmv', 'video/flv', 'video/webm', 'video/mkv', 'video/m4v', 'video/3gp', 'video/quicktime'
      ];
      const maxFileSize = 100 * 1024 * 1024; // 100MB for high-res photography and videos

      for (const file of files) {
        // Strict MIME type validation
        if (!allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
          return res.status(400).json({ 
            error: `Invalid file type: ${file.originalname}. Only JPEG, PNG, WebP, HEIC, TIFF images and MP4, MOV, AVI, WMV, WebM, MKV videos are allowed.`,
            allowedTypes: allowedMimeTypes
          });
        }

        // File size validation
        if (file.size > maxFileSize) {
          return res.status(400).json({ 
            error: `File too large: ${file.originalname}. Maximum size is ${Math.round(maxFileSize / (1024 * 1024))}MB.`,
            fileSize: Math.round(file.size / (1024 * 1024)) + "MB"
          });
        }

        // Basic file header validation (magic number check) for images and videos
        const magicNumbers = {
          // Image magic numbers
          'image/jpeg': [0xFF, 0xD8, 0xFF],
          'image/png': [0x89, 0x50, 0x4E, 0x47],
          'image/webp': [0x52, 0x49, 0x46, 0x46],
          // Video magic numbers
          'video/mp4': [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // ftyp
          'video/mov': [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70], // ftyp
          'video/quicktime': [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70],
          'video/avi': [0x52, 0x49, 0x46, 0x46], // RIFF
          'video/webm': [0x1A, 0x45, 0xDF, 0xA3] // EBML
        };

        if (magicNumbers[file.mimetype as keyof typeof magicNumbers]) {
          const expectedHeader = magicNumbers[file.mimetype as keyof typeof magicNumbers];
          const header = Array.from(file.buffer.slice(0, expectedHeader.length));
          if (!expectedHeader.every((byte, index) => header[index] === byte)) {
            return res.status(400).json({ 
              error: `File appears corrupted or invalid: ${file.originalname}. Please try re-uploading.`
            });
          }
        }

        // File name validation for images and videos
        if (!/^[\w\-. ]+\.(jpe?g|png|webp|heic|tiff|mp4|mov|avi|wmv|flv|webm|mkv|m4v|3gp)$/i.test(file.originalname)) {
          return res.status(400).json({ 
            error: `Invalid filename: ${file.originalname}. Use only letters, numbers, spaces, dots, and hyphens.`
          });
        }
      }

      const { category = "portfolio" } = req.body;

      console.log(`Processing ${files.length} uploaded file(s)...`);

      // Create database entries for uploaded images
      const uploadedImages = [];
      const { bookingId } = req.body;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filename = `${Date.now()}_${i}_${file.originalname}`;

        // For demo: using base64 data URL since we don't have cloud storage
        const base64Data = file.buffer.toString('base64');
        const dataUrl = `data:${file.mimetype};base64,${base64Data}`;

        try {
          const imageData = {
            filename,
            originalName: file.originalname,
            url: dataUrl, // Base64 data URL containing the actual image
            thumbnailUrl: dataUrl, // Using same image as thumbnail for demo
            category,
            tags: [category, "uploaded"],
            featured: false,
            bookingId: bookingId ? parseInt(bookingId) : null,
          };

          // Save to database
          const savedImage = await storage.createGalleryImage(imageData);
          uploadedImages.push(savedImage);

          console.log(`Saved image ${i + 1}/${files.length}: ${file.originalname}`);
        } catch (dbError) {
          console.error(`Failed to save image ${file.originalname}:`, dbError);
          // Continue with other images even if one fails
        }
      }

      if (uploadedImages.length === 0) {
        return res.status(500).json({ 
          error: "Save failed", 
          message: "Failed to save any images to the gallery. Please try again."
        });
      }

      console.log(`Successfully uploaded ${uploadedImages.length} image(s) to gallery`);

      res.json({ 
        message: `${uploadedImages.length} image(s) uploaded successfully`,
        images: uploadedImages
      });
    } catch (error) {
      console.error("Error in upload handler:", error);
      res.status(500).json({ 
        error: "Upload failed", 
        message: "An unexpected error occurred while uploading. Please try again.",
        details: (error as Error).message 
      });
    }
  });

  app.delete("/api/gallery/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const imageId = parseInt(req.params.id);

      await storage.deleteGalleryImage(imageId);

      res.json({ message: "Image deleted successfully" });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ error: "Failed to delete image" });
    }
  });

  app.patch("/api/gallery/:id/featured", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const imageId = parseInt(req.params.id);
      const { featured } = req.body;

      await storage.updateGalleryImage(imageId, { featured });

      res.json({ 
        message: "Image featured status updated",
        featured
      });
    } catch (error) {
      console.error("Error updating featured status:", error);
      res.status(500).json({ error: "Failed to update featured status" });
    }
  });

  // AI Chat routes (legacy OpenAI)
  app.post("/api/ai-chat", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { sessionId, message, clientEmail } = req.body;

      if (!sessionId || !message) {
        return res.status(400).json({ error: "Session ID and message are required" });
      }

      // Get or create chat session
      let chat = await storage.getAiChat(sessionId);

      if (!chat) {
        chat = await storage.createAiChat({
          sessionId,
          clientEmail: clientEmail || null,
          messages: [],
          bookingData: {},
        });
      }

      // Add user message
      const messages = [
        ...chat.messages,
        {
          role: 'user' as const,
          content: message,
          timestamp: Date.now(),
        }
      ];

      // Generate AI response
      const aiResponse = await generateBookingResponse(messages, chat.bookingData);

      // Add AI response
      messages.push({
        role: 'assistant' as const,
        content: aiResponse.message,
        timestamp: Date.now(),
      });

      // Update chat
      await storage.updateAiChat(sessionId, {
        messages,
        bookingData: { ...chat.bookingData, ...aiResponse.bookingData },
        clientEmail: clientEmail || chat.clientEmail,
      });

      res.json({
        message: aiResponse.message,
        bookingData: aiResponse.bookingData,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to process AI chat" });
    }
  });

  // Replit AI Chat routes
  app.post("/api/replit-ai-chat", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { sessionId, message, agent = 'general-assistant' } = req.body;

      if (!sessionId || !message) {
        return res.status(400).json({ error: "Session ID and message are required" });
      }

      // Simulate Replit AI agent response
      let response = "";

      if (agent === 'photography-business-consultant') {
        // Generate photography-specific contract recommendations
        response = `Service Type: Portrait Photography
Package Type: Standard
Total Amount: 1200
Retainer Amount: 400
Timeline: 2-3 weeks after session completion
Deliverables: 40-60 professionally edited high-resolution digital images delivered via secure online gallery
Usage Rights: Personal use and social media sharing permitted. Client may print for personal use. Commercial use requires separate licensing agreement.
Cancellation Policy: 48-hour notice required for rescheduling. Cancellations within 24 hours forfeit 50% of retainer. Weather-related cancellations may be rescheduled at no penalty.
Additional Terms: Travel fee may apply for locations over 30 miles from Honolulu. Drone photography requires suitable weather conditions and FAA-compliant airspace.`;
      } else {
        // General AI assistant response
        response = "I'm here to help you with contract recommendations and business insights. Please provide more details about your photography session requirements.";
      }

      res.json({
        response: response,
        agent: agent,
        sessionId: sessionId
      });
    } catch (error) {
      console.error("Replit AI chat error:", error);
      res.status(500).json({ error: "Failed to process Replit AI chat" });
    }
  });

  app.get("/api/ai-chat/:sessionId", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const chat = await storage.getAiChat(req.params.sessionId);
      if (!chat) {
        return res.status(404).json({ error: "Chat session not found" });
      }
      res.json(chat);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat session" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/stats", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      const stats = await storage.getBookingStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });


  app.get("/api/analytics/revenue/:year/:month", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const revenue = await storage.getMonthlyRevenue(year, month);
      res.json({ revenue });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch revenue data" });
    }
  });

  // Invoice routes
  app.get("/api/invoices/:bookingId", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const invoice = await storage.getInvoice(parseInt(req.params.bookingId));
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });

  app.post("/api/invoices", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { bookingId } = req.body;

      if (bookingId) {
        // Auto-generate invoice from booking
        const booking = await storage.getBooking(bookingId);
        if (!booking) {
          return res.status(404).json({ error: "Booking not found" });
        }

        const invoiceData = {
          bookingId: booking.id,
          amount: booking.totalPrice,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'pending' as const
        };

        const validatedData = insertInvoiceSchema.parse(invoiceData);
        const invoice = await storage.createInvoice(validatedData);
        return res.json(invoice);
      }

      // Direct invoice creation from raw data
      const invoiceData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(invoiceData);
      res.json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid invoice data", details: error.errors });
      } else {
        console.error("Error creating invoice:", error);
        res.status(500).json({ error: "Failed to create invoice", details: (error as Error).message });
      }
    }
  });

  // Client Portal Authentication Routes
  app.post("/api/client-portal/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find client by email
      const client = await storage.getClientByEmail(email);
      if (!client) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password against stored hash
      const credential = await storage.getClientCredential(client.id);
      if (!credential || !credential.passwordHash) {
        return res.status(401).json({ error: "No password set. Please contact administrator or use magic link." });
      }

      const isValidPassword = await storage.verifyClientPassword(client.id, password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Update last login timestamp
      await storage.updateClientLastLogin(client.id);

      // Generate proper JWT token for client
      const token = generateToken({
        userId: client.id,
        username: client.email,
        role: 'client'
      });

      res.json({
        id: client.id,
        name: client.name,
        email: client.email,
        token
      });
    } catch (error) {
      console.error("Client login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/client-portal/magic-link", async (req, res) => {
    try {
      const { email } = req.body;

      const client = await storage.getClientByEmail(email);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      // Generate secure magic link token and store it
      const token = `magic_${client.id}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
      await storage.setMagicLinkToken(client.id, token, expiry);

      const magicLink = `${process.env.REPL_URL || 'http://localhost:5000'}/client-portal?token=${token}`;

      // Send magic link via Neon email service
      try {
        const { neonEmailService } = await import('./neon-email.js');
        const emailSent = await neonEmailService.sendMagicLinkEmail(email, client.name, magicLink);

        if (emailSent) {
          console.log(`✅ Magic link sent to: ${email}`);
          res.json({ message: "Magic link sent to your email" });
        } else {
          console.log(`⚠️  Magic link fallback for: ${email} - ${magicLink}`);
          res.json({ message: "Magic link sent (check console for development link)" });
        }
      } catch (error) {
        console.error("Email service error:", error);
        console.log(`🔗 Development magic link for ${email}: ${magicLink}`);
        res.json({ message: "Magic link generated (check console for development link)" });
      }

    } catch (error) {
      console.error("Magic link error:", error);
      res.status(500).json({ error: "Failed to send magic link" });
    }
  });

  // Verify magic link token and authenticate client
  app.post("/api/client-portal/verify-magic-link", async (req, res) => {
    try {
      const { token } = req.body;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: "Token is required" });
      }

      // Extract client ID from token format: magic_<clientId>_<timestamp>_<random>
      const parts = token.split('_');
      if (parts.length < 4 || parts[0] !== 'magic') {
        return res.status(401).json({ error: "Invalid token format" });
      }

      const clientId = parseInt(parts[1]);
      if (isNaN(clientId)) {
        return res.status(401).json({ error: "Invalid token" });
      }

      // Verify the token against stored value
      const credential = await storage.getClientCredential(clientId);
      if (!credential || credential.magicLinkToken !== token) {
        return res.status(401).json({ error: "Invalid or expired magic link" });
      }

      // Check expiry
      if (credential.magicLinkExpiry && new Date(credential.magicLinkExpiry) < new Date()) {
        await storage.clearMagicLinkToken(clientId);
        return res.status(401).json({ error: "Magic link has expired" });
      }

      // Token is valid — clear it (single use) and authenticate
      await storage.clearMagicLinkToken(clientId);

      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      await storage.updateClientLastLogin(clientId);

      const jwtToken = generateToken({
        userId: client.id,
        username: client.email,
        role: 'client'
      });

      res.json({
        id: client.id,
        name: client.name,
        email: client.email,
        token: jwtToken
      });
    } catch (error) {
      console.error("Magic link verification error:", error);
      res.status(500).json({ error: "Verification failed" });
    }
  });

  app.get("/api/client-portal/bookings", authenticateToken, async (req: AuthRequest, res) => {
    try {
      // Use authenticated user's ID for security - ignore clientId from query params
      const clientId = req.user!.id;
      const bookings = await storage.getBookings();
      const clientBookings = bookings.filter(b => b.clientId === clientId);

      res.json(clientBookings);
    } catch (error) {
      console.error("Error fetching client bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.get("/api/client-portal/galleries", authenticateToken, async (req: AuthRequest, res) => {
    try {
      // Use authenticated user's ID for security - ignore clientId from query params
      const clientId = req.user!.id;

      // Get real galleries from bookings and gallery images
      const bookings = await storage.getBookings();
      const galleryImages = await storage.getGalleryImages();

      const clientBookings = bookings.filter(b => b.clientId === clientId);

      const galleries = clientBookings.map(booking => {
        const bookingImages = galleryImages.filter(img => img.bookingId === booking.id);
        return {
          id: booking.id.toString(),
          name: `${booking.service?.name || 'Photography Session'} - ${new Date(booking.date).toLocaleDateString()}`,
          clientId: clientId,
          status: bookingImages.length > 0 ? 'proofing' : 'pending',
          coverImage: bookingImages.length > 0 ? bookingImages[0].url : null,
          photoCount: bookingImages.length,
          createdAt: booking.createdAt
        };
      });

      // Also include galleries that have images but no specific booking
      const unbookedImages = galleryImages.filter(img => 
        !img.bookingId && img.tags?.includes('client_gallery')
      );

      if (unbookedImages.length > 0) {
        galleries.push({
          id: `unbooked_${clientId}`,
          name: 'Additional Photos',
          clientId: clientId,
          status: 'proofing',
          coverImage: unbookedImages[0].url,
          photoCount: unbookedImages.length,
          createdAt: new Date()
        });
      }

      res.json(galleries);
    } catch (error) {
      console.error("Error fetching client galleries:", error);
      res.status(500).json({ error: "Failed to fetch galleries" });
    }
  });

  app.get("/api/client-portal/gallery/:galleryId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { galleryId } = req.params;
      const clientId = req.user!.id;

      let galleryImages = [];
      let galleryName = "";
      let galleryStatus = "proofing";
      let createdAt: Date | string = new Date().toISOString();

      if (galleryId.startsWith('unbooked_')) {
        // Handle unbooked images — verify the gallery belongs to this client
        const galleryClientId = parseInt(galleryId.replace('unbooked_', ''));
        if (galleryClientId !== clientId) {
          return res.status(403).json({ error: "Access denied" });
        }
        const allImages = await storage.getGalleryImages();
        galleryImages = allImages.filter(img =>
          !img.bookingId && img.tags?.includes('client_gallery')
        );
        galleryName = "Additional Photos";
      } else {
        // Handle booking-specific gallery
        const bookingId = parseInt(galleryId);
        const booking = await storage.getBooking(bookingId);
        galleryImages = await storage.getImagesByBooking(bookingId);

        if (!booking) {
          return res.status(404).json({ error: "Gallery not found" });
        }

        // Verify the authenticated client owns this booking
        if (booking.clientId !== clientId) {
          return res.status(403).json({ error: "Access denied" });
        }

        galleryName = `${booking.service?.name || 'Photography Session'} - ${new Date(booking.date).toLocaleDateString()}`;
        galleryStatus = galleryImages.length > 0 ? 'proofing' : 'pending';
        createdAt = booking.createdAt;
      }

      const gallery = {
        id: galleryId,
        name: galleryName,
        status: galleryStatus,
        createdAt: createdAt,
        images: galleryImages.map(img => ({
          id: img.id.toString(),
          url: img.url,
          thumbnailUrl: img.thumbnailUrl || img.url,
          filename: img.filename
        }))
      };

      res.json(gallery);
    } catch (error) {
      console.error("Error fetching gallery:", error);
      res.status(500).json({ error: "Failed to fetch gallery" });
    }
  });

  app.get("/api/client-portal/selections/:galleryId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { galleryId } = req.params;
      const clientId = req.user!.id;

      // Verify the client owns this gallery
      if (galleryId.startsWith('unbooked_')) {
        const galleryClientId = parseInt(galleryId.replace('unbooked_', ''));
        if (galleryClientId !== clientId) {
          return res.status(403).json({ error: "Access denied" });
        }
      } else {
        const bookingId = parseInt(galleryId);
        const booking = await storage.getBooking(bookingId);
        if (booking && booking.clientId !== clientId) {
          return res.status(403).json({ error: "Access denied" });
        }
      }

      const selections = await storage.getGallerySelections(galleryId, clientId);

      res.json(selections || {
        galleryId,
        clientId,
        favorites: [],
        comments: {}
      });
    } catch (error) {
      console.error("Error fetching selections:", error);
      res.status(500).json({ error: "Failed to fetch selections" });
    }
  });

  app.post("/api/client-portal/selections/:galleryId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { galleryId } = req.params;
      const { favorites, comments } = req.body;
      const clientId = req.user!.id;

      // Verify the client owns this gallery
      if (galleryId.startsWith('unbooked_')) {
        const galleryClientId = parseInt(galleryId.replace('unbooked_', ''));
        if (galleryClientId !== clientId) {
          return res.status(403).json({ error: "Access denied" });
        }
      } else {
        const bookingId = parseInt(galleryId);
        const booking = await storage.getBooking(bookingId);
        if (booking && booking.clientId !== clientId) {
          return res.status(403).json({ error: "Access denied" });
        }
      }

      await storage.saveGallerySelections(galleryId, clientId, favorites || [], comments || {});

      res.json({ message: "Selections saved successfully" });
    } catch (error) {
      console.error("Error saving selections:", error);
      res.status(500).json({ error: "Failed to save selections" });
    }
  });

  app.get("/api/client-portal/contracts", authenticateToken, async (req: AuthRequest, res) => {
    try {
      // Use authenticated user's ID for security - ignore clientId from query params
      const clientId = req.user!.id;

      // Get contracts directly by client ID
      const allContracts = await storage.getContracts();
      const clientContracts = allContracts.filter(contract => contract.clientId === clientId);

      const contracts = clientContracts.map(contract => ({
        id: contract.id,
        clientId: clientId,
        title: contract.title || `${contract.serviceType || 'Photography'} Contract`,
        status: contract.status,
        clientSignedAt: contract.clientSignedAt,
        photographerSignedAt: contract.photographerSignedAt,
        isFullySigned: contract.isFullySigned,
        createdAt: contract.createdAt,
        totalAmount: contract.totalAmount,
        downloadUrl: `/api/contracts/${contract.id}/download`,
        signUrl: contract.status === 'sent' && !contract.clientSignedAt ? `/client-portal/contract/${contract.portalAccessToken}` : null,
        templateContent: contract.templateContent
      }));

      res.json(contracts);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ error: "Failed to fetch contracts" });
    }
  });

  // Client portal contract signing endpoint
  app.post("/api/client-portal/contracts/:id/sign", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const contractId = parseInt(req.params.id);
      const clientId = req.user!.id;
      const { signatureData } = req.body;

      if (!signatureData || !signatureData.fullName) {
        return res.status(400).json({ error: "Signature data is required" });
      }

      // Verify the authenticated client owns this contract
      const contract = await storage.getContract(contractId);
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      if (contract.clientId !== clientId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Update contract with client signature
      const updates = {
        clientSignature: signatureData.signature,
        clientSignedAt: new Date(),
        clientIpAddress: req.ip,
        status: 'signed' as const,
        signatureMetadata: {
          clientDevice: 'web',
          clientUserAgent: signatureData.userAgent,
          signatureMethod: signatureData.signatureMethod || 'electronic'
        },
        updatedAt: new Date()
      };

      const updatedContract = await storage.updateContract(contractId, updates);

      // Check if fully signed (if photographer has already signed)
      if (updatedContract.photographerSignedAt) {
        await storage.updateContract(contractId, { 
          isFullySigned: true,
          status: 'completed'
        });
      }

      res.json({ 
        success: true, 
        message: "Contract signed successfully",
        contract: updatedContract
      });
    } catch (error) {
      console.error("Error signing contract:", error);
      res.status(500).json({ error: "Failed to sign contract" });
    }
  });

  // Get contract for signing by token
  app.get("/api/client-portal/contracts/sign/:token", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { token } = req.params;

      const allContracts = await storage.getContracts();
      const contract = allContracts.find(c => c.portalAccessToken === token);

      if (!contract) {
        return res.status(404).json({ error: "Contract not found or invalid token" });
      }

      if (contract.clientSignedAt) {
        return res.status(400).json({ error: "Contract has already been signed" });
      }

      res.json({
        id: contract.id,
        title: contract.title,
        templateContent: contract.templateContent,
        totalAmount: contract.totalAmount,
        createdAt: contract.createdAt,
        clientId: contract.clientId
      });
    } catch (error) {
      console.error("Error fetching contract for signing:", error);
      res.status(500).json({ error: "Failed to fetch contract" });
    }
  });

  // ===== Admin Client Portal API Routes =====
  app.get("/api/admin/client-portal-sessions", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      const sessions = await storage.getClientPortalSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching client portal sessions:", error);
      res.status(500).json({ error: "Failed to fetch client portal sessions" });
    }
  });

  // Send welcome emails to all clients
  app.post("/api/admin/send-welcome-emails", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      const clients = await storage.getClients();

      // Send welcome emails via Neon email service
      let sentCount = 0;
      try {
        const { neonEmailService } = await import('./neon-email.js');
        for (const client of clients) {
          if (client.email) {
            const magicLink = `${process.env.REPL_URL || 'http://localhost:5000'}/client-portal`;
            const sent = await neonEmailService.sendMagicLinkEmail(client.email, client.name, magicLink);
            if (sent) sentCount++;
          }
        }
      } catch (emailError) {
        console.error("Email service unavailable:", emailError);
      }

      res.json({ success: true, count: clients.length, sent: sentCount });
    } catch (error) {
      console.error("Error sending welcome emails:", error);
      res.status(500).json({ error: "Failed to send welcome emails" });
    }
  });

  // Reset all client portal sessions
  app.post("/api/admin/reset-portal-sessions", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      await storage.clearAllPortalSessions();
      res.json({ success: true, message: "All portal sessions have been reset" });
    } catch (error) {
      console.error("Error resetting portal sessions:", error);
      res.status(500).json({ error: "Failed to reset portal sessions" });
    }
  });

  app.get("/api/admin/client-portal-stats", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      const stats = await storage.getClientPortalStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching client portal stats:", error);
      res.status(500).json({ error: "Failed to fetch client portal stats" });
    }
  });

  // Client Portal Invoices
  app.get("/api/client-portal/invoices", authenticateToken, async (req: AuthRequest, res) => {
    try {
      // Use authenticated user's ID for security - ignore clientId from query params
      const clientId = req.user!.id;

      // Get client bookings and generate invoice data
      const bookings = await storage.getBookings();
      const clientBookings = bookings.filter(b => b.clientId === clientId);

      const invoices = clientBookings.map(booking => ({
        id: `INV-${booking.id}`,
        bookingId: booking.id,
        invoiceNumber: `INV-${booking.id}-${new Date(booking.date).getFullYear()}`,
        amount: booking.totalPrice,
        status: booking.status === 'confirmed' ? 'paid' : 'pending',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdDate: booking.createdAt || new Date().toISOString(),
        description: `${booking.service?.name || 'Photography Service'} - ${new Date(booking.date).toLocaleDateString()}`,
        downloadUrl: `/api/invoices/pdf/INV-${booking.id}`
      }));

      res.json(invoices);
    } catch (error) {
      console.error("Error fetching client invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  // ===== Client Credential Management API Routes =====
  app.get("/api/admin/client-credentials", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      const credentialsWithClients = await storage.getClientCredentials();

      const credentials = credentialsWithClients.map(cred => ({
        id: cred.id,
        clientId: cred.clientId,
        clientName: cred.client.name,
        clientEmail: cred.client.email,
        hasPassword: !!cred.passwordHash,
        passwordSet: !!cred.passwordHash,
        lastLogin: cred.lastLogin,
        magicLinkSent: !!cred.magicLinkToken,
        portalAccess: cred.portalAccess,
        createdAt: cred.createdAt
      }));

      res.json(credentials);
    } catch (error) {
      console.error("Error fetching client credentials:", error);
      res.status(500).json({ error: "Failed to fetch client credentials" });
    }
  });

  app.post("/api/admin/client-credentials/set-password", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { clientId, password } = req.body;

      if (!clientId || !password) {
        return res.status(400).json({ error: "Client ID and password are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }

      await storage.setClientPassword(clientId, password);

      res.json({ message: "Password set successfully" });
    } catch (error) {
      console.error("Error setting client password:", error);
      res.status(500).json({ error: "Failed to set password" });
    }
  });

  app.post("/api/admin/client-credentials/magic-link", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { clientId } = req.body;

      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      if (!client.phone) {
        return res.status(400).json({ error: "Client phone number is required for SMS delivery" });
      }

      // Generate secure token with expiration (24 hours)
      const token = `magic_${clientId}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const magicLink = `${process.env.REPL_URL || 'http://localhost:5000'}/client-portal?token=${token}`;

      // Save token to database
      await storage.setMagicLinkToken(clientId, token, expiry);

      // Import SMS functionality
      const { sendMagicLinkSMS, isTwilioConfigured } = await import('./twilio.js');

      if (!isTwilioConfigured()) {
        console.log(`Magic link for ${client.email}: ${magicLink}`);
        return res.json({ 
          message: "Twilio not configured - magic link logged to console",
          link: magicLink,
          method: "console"
        });
      }

      // Send magic link via SMS
      const smsSuccess = await sendMagicLinkSMS(client.name, client.phone, magicLink);

      if (smsSuccess) {
        res.json({ 
          message: "Magic link sent via SMS successfully",
          method: "sms",
          phone: client.phone
        });
      } else {
        // Fallback to console logging if SMS fails
        console.log(`SMS failed - Magic link for ${client.email}: ${magicLink}`);
        res.json({ 
          message: "SMS failed - magic link logged to console",
          link: magicLink,
          method: "console_fallback"
        });
      }
    } catch (error) {
      console.error("Error sending magic link:", error);
      res.status(500).json({ error: "Failed to send magic link" });
    }
  });

  // Get client credentials for admin management (duplicate route for backwards compatibility)
  app.get("/api/client-credentials", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      const credentialsWithClients = await storage.getClientCredentials();

      const credentials = credentialsWithClients.map(cred => ({
        id: cred.id,
        clientId: cred.clientId,
        clientName: cred.client.name,
        clientEmail: cred.client.email,
        hasPassword: !!cred.passwordHash,
        passwordSet: !!cred.passwordHash,
        lastLogin: cred.lastLogin,
        magicLinkSent: !!cred.magicLinkToken,
        portalAccess: cred.portalAccess,
        createdAt: cred.createdAt
      }));

      res.json(credentials);
    } catch (error) {
      console.error("Error fetching client credentials:", error);
      res.status(500).json({ error: "Failed to fetch client credentials" });
    }
  });

  app.post("/api/admin/client-credentials/toggle-access", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { clientId, enabled } = req.body;

      if (clientId === undefined || enabled === undefined) {
        return res.status(400).json({ error: "Client ID and enabled status are required" });
      }

      await storage.toggleClientPortalAccess(clientId, enabled);

      res.json({ message: "Portal access updated successfully" });
    } catch (error) {
      console.error("Error updating portal access:", error);
      res.status(500).json({ error: "Failed to update portal access" });
    }
  });

  // ===== Integration API Routes =====
  app.get("/api/integrations", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      const integrationsList = await storage.getIntegrations();
      const response = integrationsList.map(integration => ({
        id: integration.integrationId,
        name: integration.name,
        isConnected: integration.isConnected,
        isActive: integration.isActive,
        status: integration.status,
        lastSync: integration.lastSync,
        error: integration.error
      }));
      res.json(response);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      res.status(500).json({ error: "Failed to fetch integrations" });
    }
  });

  app.put("/api/integrations/:id/toggle", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      await storage.updateIntegration(id, { isActive });
      
      res.json({
        success: true,
        message: `Integration ${id} ${isActive ? 'activated' : 'deactivated'}`,
        integration: {
          id,
          isActive,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Integration toggle error:", error);
      res.status(500).json({ error: "Failed to toggle integration" });
    }
  });

  // ===== Invoice Analytics API Routes =====
  app.get("/api/invoices/stats", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      const stats = await storage.getInvoiceStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching invoice stats:", error);
      res.status(500).json({ error: "Failed to fetch invoice stats" });
    }
  });

  // Get all invoices
  app.get("/api/invoices", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      // Get real invoices from database
      const bookings = await storage.getBookings();
      const invoicesList = [];

      // Convert ALL bookings to invoices format for display, showing proper service pricing
      for (const booking of bookings) {
        // Calculate invoice items from service and add-ons
        const items = [];

        // Base service item
        const baseServicePrice = Number(booking.service?.price || 0);
        items.push({
          description: booking.service?.name || 'Photography Service',
          quantity: 1,
          rate: baseServicePrice,
          amount: baseServicePrice
        });

        // Add-on items from booking
        let addOnTotal = 0;
        if (booking.addOns && Array.isArray(booking.addOns)) {
          booking.addOns.forEach(addOn => {
            const addOnPrice = Number(addOn.price || 0);
            items.push({
              description: addOn.name || 'Add-on Service',
              quantity: 1,
              rate: addOnPrice,
              amount: addOnPrice
            });
            addOnTotal += addOnPrice;
          });
        }

        // Calculate totals using totalPrice from booking (which includes base + add-ons)
        const totalAmount = Number(booking.totalPrice || baseServicePrice);

        const invoice = {
          id: `INV-${booking.id}`,
          bookingId: booking.id,
          clientName: booking.client?.name || 'Unknown Client',
          clientEmail: booking.client?.email || '',
          invoiceNumber: `INV-${booking.id}-${new Date(booking.date).getFullYear()}`,
          amount: totalAmount,
          status: booking.status === 'confirmed' ? 'pending' : 'draft',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          createdDate: booking.createdAt || new Date().toISOString(),
          items: items,
          subtotal: totalAmount,
          total: totalAmount,
          notes: `Photography session for ${booking.client?.name || 'client'} on ${new Date(booking.date).toLocaleDateString()}. ${booking.notes || ''}`
        };
        invoicesList.push(invoice);
      }

      res.json(invoicesList);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.get("/api/analytics/business-kpis", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      const kpis = await storage.getBusinessKPIs();
      res.json(kpis);
    } catch (error) {
      console.error("Error fetching business KPIs:", error);
      res.status(500).json({ error: "Failed to fetch business KPIs" });
    }
  });

  app.get("/api/analytics/clients", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      const metrics = await storage.getClientMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching client metrics:", error);
      res.status(500).json({ error: "Failed to fetch client metrics" });
    }
  });

  // ===== Contact Messages API Routes =====
  app.get("/api/contact-messages", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ error: "Failed to fetch contact messages" });
    }
  });

  // AI contact categorization endpoint
  app.post("/api/ai/categorize-contact", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { subject, message } = req.body;

      // Use Replit AI to categorize the contact and suggest response
      const prompt = `Analyze this contact form submission and categorize it:

Subject: ${subject}
Message: ${message}

Please respond with a JSON object containing:
{
  "category": "wedding_inquiry|portrait_inquiry|event_inquiry|pricing_question|general_inquiry|complaint|booking_request",
  "suggestedResponse": "A brief, personalized response to acknowledge their inquiry and next steps"
}`;

      let category = "general_inquiry";
      let suggestedResponse = "Thank you for your inquiry! We'll get back to you within 24 hours.";

      try {
        const response = await fetch('https://api.replit.com/v1/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REPLIT_AI_TOKEN || 'demo-token'}`
          },
          body: JSON.stringify({
            model: 'replit-agent',
            messages: [
              { role: 'user', content: prompt }
            ],
            max_tokens: 200,
            temperature: 0.3
          })
        });

        if (response.ok) {
          const aiData = await response.json();
          const aiResponse = aiData.choices?.[0]?.message?.content;

          if (aiResponse) {
            try {
              const parsed = JSON.parse(aiResponse);
              category = parsed.category || category;
              suggestedResponse = parsed.suggestedResponse || suggestedResponse;
            } catch (parseError) {
              // If JSON parsing fails, extract manually
              if (aiResponse.toLowerCase().includes('wedding')) category = 'wedding_inquiry';
              else if (aiResponse.toLowerCase().includes('portrait')) category = 'portrait_inquiry';
              else if (aiResponse.toLowerCase().includes('event')) category = 'event_inquiry';
              else if (aiResponse.toLowerCase().includes('pricing')) category = 'pricing_question';
            }
          }
        }
      } catch (error) {
        console.error('Replit AI categorization failed:', error);
      }

      res.json({ category, suggestedResponse });
    } catch (error) {
      console.error("AI categorization error:", error);
      res.status(500).json({ 
        category: "general_inquiry",
        suggestedResponse: "Thank you for your inquiry! We'll get back to you within 24 hours."
      });
    }
  });

  app.patch("/api/contact-messages/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const message = await storage.updateContactMessage(parseInt(id), updates);
      res.json(message);
    } catch (error) {
      console.error("Error updating contact message:", error);
      res.status(500).json({ error: "Failed to update message" });
    }
  });

  app.delete("/api/contact-messages/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      await storage.deleteContactMessage(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting contact message:", error);
      res.status(500).json({ error: "Failed to delete message" });
    }
  });


  // ===== Invoice PDF & Email Routes =====
  app.post("/api/invoices/pdf/:invoiceNumber", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { invoiceNumber } = req.params;
      const invoiceData = req.body;

      // Import PDF generator
      const { generateInvoiceHTML } = await import("./pdf-generator.js");

      // Convert invoice data to proper format
      const pdfData = {
        invoiceNumber: invoiceData.invoiceNumber,
        invoiceDate: invoiceData.createdDate,
        dueDate: invoiceData.dueDate,
        clientName: invoiceData.clientName,
        clientEmail: invoiceData.clientEmail,
        items: invoiceData.items || [],
        subtotal: invoiceData.amount || 0,
        total: invoiceData.amount || 0,
        notes: invoiceData.notes || '',
        tax: 0,
        taxRate: 0,
        discount: 0
      };

      const html = generateInvoiceHTML(pdfData);

      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceNumber}.pdf"`);
      res.send(html);

    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  app.post("/api/invoices/send/:invoiceNumber", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { invoiceNumber } = req.params;
      const { invoice, includePaymentLink } = req.body;

      // Import email functionality
      const { emailInvoice } = await import("./pdf-generator.js");

      // Convert invoice data
      const emailData = {
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.createdDate,
        dueDate: invoice.dueDate,
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        items: invoice.items,
        subtotal: invoice.amount,
        total: invoice.amount,
        notes: invoice.notes
      };

      const success = await emailInvoice(emailData, "");

      if (success) {
        res.json({ 
          success: true, 
          message: `Invoice ${invoiceNumber} sent successfully to ${invoice.clientEmail}`,
          paymentLink: includePaymentLink ? `https://pay.christianpicaso.com/invoice/${invoiceNumber}` : null
        });
      } else {
        res.status(500).json({ error: "Failed to send email" });
      }

    } catch (error) {
      console.error("Email send error:", error);
      res.status(500).json({ error: "Failed to send invoice email" });
    }
  });

  // Real-time analytics endpoint
  app.get("/api/analytics/realtime", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      const bookings = await storage.getBookings();
      const clients = await storage.getClients();
      const contactMessages = await storage.getContactMessages();

      // Calculate real-time metrics from actual data
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      const todayBookings = bookings.filter(b => new Date(b.createdAt) >= todayStart);
      const todayClients = clients.filter(c => new Date(c.createdAt) >= todayStart);
      const todayMessages = contactMessages.filter(m => new Date(m.createdAt) >= todayStart);

      // Calculate authentic metrics from real business data
      // Estimate visitors based on contact messages and bookings activity

      // Calculate lead sources from actual client data
      const leadSources = clients.reduce((acc: any, client: any) => {
        const source = client.source || 'Direct';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});

      const totalLeads = clients.length;
      const trafficSources = Object.entries(leadSources).map(([source, count]: [string, any]) => ({
        source,
        visitors: count,
        percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0
      }));

      const realTimeData = {
        newBookings: todayBookings.length,
        totalBookings: bookings.length,
        newClients: todayClients.length,
        totalClients: clients.length,
        newInquiries: todayMessages.length,
        recentActivity: [
          ...todayMessages.slice(0, 3).map(m => ({
            action: "New inquiry",
            client: m.name,
            time: new Date(m.createdAt).toLocaleTimeString()
          })),
          ...todayBookings.slice(0, 2).map(b => ({
            action: "New booking",
            client: b.client?.name || "Unknown",
            time: new Date(b.createdAt).toLocaleTimeString()
          }))
        ],
        trafficSources: trafficSources.length > 0 ? trafficSources.slice(0, 4) : [
          { source: "Direct", visitors: clients.length, percentage: 100 }
        ]
      };

      res.json(realTimeData);
    } catch (error) {
      console.error("Error fetching real-time analytics:", error);
      res.status(500).json({ error: "Failed to fetch real-time analytics" });
    }
  });

  // Automation sequences endpoints (schema exists, storage layer not yet implemented)
  app.get("/api/automation-sequences", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      res.json([]);
    } catch (error) {
      console.error("Error fetching automation sequences:", error);
      res.status(500).json({ error: "Failed to fetch automation sequences" });
    }
  });

  app.post("/api/automation-sequences", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    res.status(501).json({ error: "Automation sequences are not yet implemented" });
  });

  // Client Portal Messaging API
  app.get("/api/client-portal/messages", authenticateToken, async (req: AuthRequest, res) => {
    try {
      // Use authenticated user's ID for security - ignore clientId from query params
      const clientId = req.user!.id;

      const messages = await storage.getClientMessages(clientId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching client messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/client-portal/send-message", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { message, senderName, senderEmail } = req.body;
      // Use authenticated user's ID for security - ignore clientId from body
      const clientId = req.user!.id;

      if (!message || !senderName || !senderEmail) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newMessage = await storage.createClientMessage({
        clientId,
        message,
        isFromClient: true,
        senderName,
        senderEmail,
        status: 'unread'
      });

      // Also create a contact message for admin inbox
      await storage.createContactMessage({
        name: senderName,
        email: senderEmail,
        phone: '',
        subject: 'Client Portal Message',
        message: `Message from client portal:\n\n${message}`,
        status: 'unread',
        priority: 'normal',
        source: 'client_portal'
      });

      res.json(newMessage);
    } catch (error) {
      console.error("Error sending client message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Profile Management API
  app.get("/api/profile", async (_req, res) => {
    try {
      const profile = await storage.getProfile();
      if (!profile) {
        // Return default profile if none exists
        const defaultProfile = {
          id: 1,
          name: "Christian Picaso",
          title: "Professional Photographer & FAA Certified Drone Pilot",
          bio: "Capturing Hawaii's natural beauty through both traditional and aerial photography. With over 8 years of experience and FAA certification for drone operations, I specialize in creating stunning visual stories that showcase the islands' unique landscapes and special moments.",
          phone: "(808) 555-PHOTO",
          email: "christian@picaso.photography",
          address: "Honolulu, Hawaii",
          headshot: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000",
          socialMedia: {
            instagram: "@christianpicaso",
            facebook: "ChristianPicasoPhotography",
            youtube: "ChristianPicasoHawaii"
          },
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date().toISOString()
        };
        res.json(defaultProfile);
      } else {
        res.json(profile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.put("/api/profile", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const profileData = req.body;
      const updatedProfile = await storage.updateProfile(profileData);
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Contract routes
  app.get("/api/contracts", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      const contracts = await storage.getContracts();
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ error: "Failed to fetch contracts", details: (error as Error).message });
    }
  });

  app.post("/api/contracts", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const contractData = insertContractSchema.parse(req.body);
      const contract = await storage.createContract(contractData);
      res.json(contract);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid contract data", details: error.errors });
      } else {
        console.error("Error creating contract:", error);
        res.status(500).json({ error: "Failed to create contract", details: (error as Error).message });
      }
    }
  });

  app.get("/api/contracts/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const contract = await storage.getContract(parseInt(req.params.id));
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      res.json(contract);
    } catch (error) {
      console.error("Error fetching contract:", error);
      res.status(500).json({ error: "Failed to fetch contract", details: (error as Error).message });
    }
  });

  app.put("/api/contracts/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const updates = req.body;
      const contract = await storage.updateContract(parseInt(req.params.id), updates);
      res.json(contract);
    } catch (error) {
      console.error("Error updating contract:", error);
      res.status(500).json({ error: "Failed to update contract", details: (error as Error).message });
    }
  });

  app.post("/api/contracts/:id/send", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const contractId = parseInt(req.params.id);
      const result = await storage.sendContractToPortal(contractId);
      res.json(result);
    } catch (error) {
      console.error("Error sending contract:", error);
      res.status(500).json({ error: "Failed to send contract", details: (error as Error).message });
    }
  });

  // Products endpoints
  app.get("/api/products", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      const productsList = await storage.getProducts();
      res.json(productsList);
    } catch (error: any) {
      console.error("Failed to fetch products:", error);
      res.status(500).json({ message: "Failed to fetch products", details: error.message });
    }
  });

  app.post("/api/products", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Validation failed", details: error.errors });
      }
      res.status(500).json({ message: "Failed to create product", details: error.message });
    }
  });

  app.put("/api/products/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.updateProduct(productId, req.body);
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update product", details: error.message });
    }
  });

  app.delete("/api/products/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const productId = parseInt(req.params.id);
      await storage.deleteProduct(productId);
      res.json({ message: "Product deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete product", details: error.message });
    }
  });

  // Questionnaires endpoints
  app.get("/api/questionnaires", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      const questionnairesList = await storage.getQuestionnaires();
      res.json(questionnairesList);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch questionnaires", details: error.message });
    }
  });

  app.post("/api/questionnaires", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const questionnaireData = insertQuestionnaireSchema.parse(req.body);
      const questionnaire = await storage.createQuestionnaire(questionnaireData);
      res.json(questionnaire);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Validation failed", details: error.errors });
      }
      res.status(500).json({ message: "Failed to create questionnaire", details: error.message });
    }
  });

  app.put("/api/questionnaires/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const questionnaireId = parseInt(req.params.id);
      const questionnaire = await storage.updateQuestionnaire(questionnaireId, req.body);
      res.json(questionnaire);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update questionnaire", details: error.message });
    }
  });

  app.delete("/api/questionnaires/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const questionnaireId = parseInt(req.params.id);
      await storage.deleteQuestionnaire(questionnaireId);
      res.json({ message: "Questionnaire deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to delete questionnaire", details: error.message });
    }
  });

  // Sales endpoint (returns orders formatted for the product-sales dashboard)
  app.get("/api/sales", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      const ordersList = await storage.getOrders();
      const productsList = await storage.getProducts();

      const sales = ordersList.flatMap(order => {
        if (!order.items || !Array.isArray(order.items)) return [];
        return order.items.map((item: any) => {
          const product = productsList.find(p => p.id === item.productId);
          return {
            id: order.id,
            productId: item.productId,
            productName: product?.name || item.name || 'Unknown Product',
            quantity: item.quantity || 1,
            unitPrice: item.price || 0,
            totalAmount: (item.price || 0) * (item.quantity || 1),
            customerName: order.customerName || 'Unknown',
            customerEmail: order.customerEmail || '',
            status: order.status || 'completed',
            createdAt: order.createdAt
          };
        });
      });

      res.json(sales);
    } catch (error: any) {
      console.error("Failed to fetch sales:", error);
      res.status(500).json({ message: "Failed to fetch sales", details: error.message });
    }
  });

  // Orders endpoints
  app.get("/api/orders", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      const ordersList = await storage.getOrders();
      res.json(ordersList);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch orders", details: error.message });
    }
  });

  // Analytics endpoints
  app.get("/api/analytics/products", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      const productsList = await storage.getProducts();
      const ordersList = await storage.getOrders();

      const totalRevenue = ordersList.reduce((sum, order) => sum + Number(order.total || 0), 0);
      const totalSales = ordersList.length;

      const productSales: Record<number, { count: number; revenue: number; name: string }> = {};
      for (const order of ordersList) {
        if (order.items && Array.isArray(order.items)) {
          for (const item of order.items) {
            if (!productSales[item.productId]) {
              const product = productsList.find(p => p.id === item.productId);
              productSales[item.productId] = { count: 0, revenue: 0, name: product?.name || 'Unknown' };
            }
            productSales[item.productId].count += item.quantity;
            productSales[item.productId].revenue += item.price * item.quantity;
          }
        }
      }

      const topProducts = Object.entries(productSales)
        .map(([id, data]) => ({ id: Number(id), ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      res.json({
        totalRevenue,
        totalSales,
        topProducts,
        salesTrend: []
      });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch product analytics", details: error.message });
    }
  });

  app.get("/api/questionnaire-responses", authenticateToken, requireAdmin, async (_req: AuthRequest, res) => {
    try {
      // Get actual questionnaire data from contact messages
      const contactMessages = await storage.getContactMessages();
      const responses = contactMessages
        .filter(msg => msg.status === 'pending' || msg.status === 'responded')
        .map(msg => ({
          id: msg.id,
          clientName: msg.name,
          clientEmail: msg.email,
          serviceType: msg.subject || 'General Inquiry',
          responses: {
            message: msg.message,
            eventDate: null, // Would need additional fields
            guestCount: null,
            location: null,
            budget: null
          },
          submittedAt: msg.createdAt,
          status: msg.status || 'pending'
        }));

      res.json(responses);
    } catch (error: any) {
      console.error("Failed to fetch questionnaire responses:", error);
      res.status(500).json({ message: "Failed to fetch questionnaire responses", details: error.message });
    }
  });

  // Public contact form endpoint (no authentication required)
  app.post("/api/contact", async (req, res) => {
    try {
      const { 
        name, email, phone, subject, message, priority, 
        source 
      } = req.body;

      // Insert contact message into database
      const contactMessage = await storage.createContactMessage({
        name,
        email,
        phone,
        subject,
        message,
        priority: priority || "normal",
        source: source || "website",
        status: "unread",
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(contactMessage);
    } catch (error) {
      console.error("Error creating contact message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}