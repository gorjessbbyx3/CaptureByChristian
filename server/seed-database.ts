import { db } from './db.js';
import { 
  clients, services, bookings, contracts, invoices, 
  galleryImages, contactMessages 
} from '../shared/schema.js';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data safely (only if tables exist)
    console.log('🧹 Clearing existing data...');
    try {
      await db.delete(contactMessages);
      console.log('✓ Cleared contact messages');
    } catch (e) { console.log('ℹ️  Contact messages table not found'); }
    
    try {
      await db.delete(invoices);
      console.log('✓ Cleared invoices');
    } catch (e) { console.log('ℹ️  Invoices table not found'); }
    
    try {
      await db.delete(contracts);
      console.log('✓ Cleared contracts');
    } catch (e) { console.log('ℹ️  Contracts table not found'); }
    
    try {
      await db.delete(galleryImages);
      console.log('✓ Cleared gallery images');
    } catch (e) { console.log('ℹ️  Gallery images table not found'); }
    
    try {
      await db.delete(bookings);
      console.log('✓ Cleared bookings');
    } catch (e) { console.log('ℹ️  Bookings table not found'); }
    
    try {
      await db.delete(services);
      console.log('✓ Cleared services');
    } catch (e) { console.log('ℹ️  Services table not found'); }
    
    try {
      await db.delete(clients);
      console.log('✓ Cleared clients');
    } catch (e) { console.log('ℹ️  Clients table not found'); }

    // Seed Services
    console.log('📸 Seeding photography services...');
    const serviceData = [
      {
        name: 'Wedding Photography',
        description: 'Comprehensive wedding coverage capturing your special day from preparation to celebration. Includes 8 hours of photography, FAA-certified drone shots, and 500+ professionally edited photos.',
        price: 2500.00,
        duration: 8,
        category: 'wedding'
      },
      {
        name: 'Portrait Session',
        description: 'Professional portrait photography perfect for families, couples, or individuals. Capturing natural moments in Hawaii\'s stunning locations.',
        price: 450.00,
        duration: 2,
        category: 'portrait'
      },
      {
        name: 'Commercial Photography',
        description: 'Professional commercial photography for businesses, products, and branding. High-quality images that showcase your business professionally.',
        price: 800.00,
        duration: 4,
        category: 'commercial'
      },
      {
        name: 'Real Estate Photography',
        description: 'Professional real estate photography showcasing properties with stunning interior and exterior shots, including aerial drone photography.',
        price: 350.00,
        duration: 3,
        category: 'real_estate'
      },
      {
        name: 'Event Photography',
        description: 'Dynamic event photography capturing the energy and emotion of your special occasions, corporate events, and celebrations.',
        price: 600.00,
        duration: 4,
        category: 'event'
      }
    ];

    const insertedServices = [];
    for (const service of serviceData) {
      const [inserted] = await db.insert(services).values({
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        category: service.category
      }).returning();
      insertedServices.push(inserted);
    }

    // Seed Clients
    console.log('👥 Seeding clients...');
    const clientData = [
      {
        name: 'Emily & Michael Chen',
        email: 'emily.chen@email.com',
        phone: '(808) 555-0123',
        notes: 'Beach wedding at Lanikai. Prefer natural, candid shots. Sunset ceremony.'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '(808) 555-0156',
        notes: 'Family portrait session with 3 young children. Prefer morning session.'
      },
      {
        name: 'Paradise Realty Group',
        email: 'marketing@paradiserealty.com',
        phone: '(808) 555-0189',
        notes: 'Commercial real estate photography. Multiple properties per month.'
      },
      {
        name: 'David & Lisa Nakamura',
        email: 'nakamura.couple@email.com',
        phone: '(808) 555-0167',
        notes: 'Anniversary session in Waikiki. Celebrating 10 years together.'
      },
      {
        name: 'Kailua Coffee Company',
        email: 'info@kailuacoffee.com',
        phone: '(808) 555-0198',
        notes: 'Product photography for new coffee blends and shop branding.'
      },
      {
        name: 'Jennifer & Robert Kim',
        email: 'kimfamily@email.com',
        phone: '(808) 555-0134',
        notes: 'Maternity photos at Diamond Head. Due in December.'
      },
      {
        name: 'Amanda Williams',
        email: 'amanda.w@email.com',
        phone: '(808) 555-0145',
        notes: 'Professional headshots for LinkedIn and business materials.'
      },
      {
        name: 'Ocean View Events',
        email: 'events@oceanview.com',
        phone: '(808) 555-0178',
        notes: 'Corporate event photography. Annual company retreat.'
      }
    ];

    const insertedClients = [];
    for (const client of clientData) {
      const [inserted] = await db.insert(clients).values(client).returning();
      insertedClients.push(inserted);
    }

    // Seed Bookings
    console.log('📅 Seeding bookings...');
    const bookingData = [
      {
        clientId: insertedClients[0].id,
        serviceId: insertedServices[0].id, // Wedding
        date: new Date('2025-02-14'),
        duration: 480, // 8 hours in minutes
        location: 'Lanikai Beach, Kailua, HI',
        status: 'confirmed',
        notes: 'Sunset ceremony at 6:30 PM. Reception at Paradise Bay Resort.',
        totalPrice: 2850.00,
        depositPaid: true
      },
      {
        clientId: insertedClients[1].id,
        serviceId: insertedServices[1].id, // Portrait
        date: new Date('2025-01-20'),
        duration: 120, // 2 hours in minutes
        location: 'Kapiolani Park, Honolulu, HI',
        status: 'confirmed',
        notes: 'Family of 5. Children ages 3, 7, and 12.',
        totalPrice: 450.00,
        depositPaid: true
      },
      {
        clientId: insertedClients[2].id,
        serviceId: insertedServices[3].id, // Real Estate
        date: new Date('2025-01-18'),
        duration: 180, // 3 hours in minutes
        location: '123 Ocean View Dr, Honolulu, HI',
        status: 'completed',
        notes: 'Luxury oceanfront property. Include aerial shots of infinity pool.',
        totalPrice: 500.00,
        depositPaid: true
      },
      {
        clientId: insertedClients[3].id,
        serviceId: insertedServices[1].id, // Portrait
        date: new Date('2025-02-08'),
        duration: 120, // 2 hours in minutes
        location: 'Waikiki Beach, Honolulu, HI',
        status: 'pending',
        notes: '10th anniversary celebration. Golden hour shoot.',
        totalPrice: 450.00,
        depositPaid: false
      },
      {
        clientId: insertedClients[4].id,
        serviceId: insertedServices[2].id, // Commercial
        date: new Date('2025-01-25'),
        duration: 240, // 4 hours in minutes
        location: 'Kailua Coffee Shop, 456 Beach Rd, Kailua, HI',
        status: 'confirmed',
        notes: 'Product shots and lifestyle photography. Focus on coffee brewing process.',
        totalPrice: 950.00,
        depositPaid: true
      },
      {
        clientId: insertedClients[5].id,
        serviceId: insertedServices[1].id, // Portrait
        date: new Date('2025-03-05'),
        duration: 120, // 2 hours in minutes
        location: 'Diamond Head State Monument, Honolulu, HI',
        status: 'pending',
        notes: 'Maternity session. 32 weeks pregnant. Prefer flowing dresses.',
        totalPrice: 450.00,
        depositPaid: false
      }
    ];

    const insertedBookings = [];
    for (const booking of bookingData) {
      const [inserted] = await db.insert(bookings).values(booking).returning();
      insertedBookings.push(inserted);
    }

    // Seed Gallery Images
    console.log('🖼️  Seeding gallery images...');
    const galleryData = [
      {
        filename: 'lanikai-sunset-wedding.jpg',
        originalName: 'Lanikai Beach Sunset Wedding',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2ZmYzEwNyIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPldlZGRpbmcgUGhvdG88L3RleHQ+PC9zdmc+',
        thumbnailUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2ZmYzEwNyIvPjx0ZXh0IHg9IjEwMCIgeT0iNzUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+VGh1bWJuYWlsPC90ZXh0Pjwvc3ZnPg==',
        category: 'wedding',
        tags: ['wedding', 'sunset', 'beach', 'ceremony'],
        featured: true,
        bookingId: insertedBookings[0].id,
        aiAnalysis: {
          description: 'Beautiful sunset wedding ceremony on Lanikai Beach',
          mood: 'romantic',
          colors: ['golden', 'orange', 'blue'],
          subjects: ['bride', 'groom', 'ocean']
        }
      },
      {
        filename: 'family-portrait-kapiolani.jpg',
        originalName: 'Family Portrait at Kapiolani Park',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzRhZDA0ZiIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZhbWlseSBQb3J0cmFpdDwvdGV4dD48L3N2Zz4=',
        thumbnailUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzRhZDA0ZiIvPjwvc3ZnPg==',
        category: 'portrait',
        tags: ['family', 'children', 'park', 'natural'],
        featured: true,
        bookingId: insertedBookings[1].id,
        aiAnalysis: {
          description: 'Joyful family portrait with children playing',
          mood: 'happy',
          colors: ['green', 'natural'],
          subjects: ['family', 'children']
        }
      },
      {
        filename: 'luxury-real-estate-aerial.jpg',
        originalName: 'Ocean View Property Aerial',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwN2NjNyIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJlYWwgRXN0YXRlPC90ZXh0Pjwvc3ZnPg==',
        thumbnailUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzAwN2NjNyIvPjwvc3ZnPg==',
        category: 'real_estate',
        tags: ['aerial', 'drone', 'luxury', 'ocean', 'property'],
        featured: true,
        bookingId: insertedBookings[2].id,
        aiAnalysis: {
          description: 'Stunning aerial view of luxury oceanfront property',
          mood: 'luxurious',
          colors: ['blue', 'white'],
          subjects: ['property', 'ocean', 'pool']
        }
      },
      {
        filename: 'coffee-product-lifestyle.jpg',
        originalName: 'Kailua Coffee Lifestyle Shot',
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzg4NjMzZCIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNvZmZlZSBQaG90bzwvdGV4dD48L3N2Zz4=',
        thumbnailUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzg4NjMzZCIvPjwvc3ZnPg==',
        category: 'commercial',
        tags: ['product', 'coffee', 'lifestyle', 'branding'],
        featured: false,
        bookingId: insertedBookings[4].id,
        aiAnalysis: {
          description: 'Professional coffee product and lifestyle photography',
          mood: 'warm',
          colors: ['brown', 'cream'],
          subjects: ['coffee', 'product']
        }
      }
    ];

    for (const image of galleryData) {
      await db.insert(galleryImages).values({
        filename: image.filename,
        originalName: image.originalName,
        url: image.url,
        thumbnailUrl: image.thumbnailUrl,
        category: image.category,
        tags: image.tags,
        featured: image.featured,
        bookingId: image.bookingId,
        aiAnalysis: image.aiAnalysis
      });
    }

    // Seed Contracts
    console.log('📄 Seeding contracts...');
    const contractData = [
      {
        clientId: insertedClients[0].id,
        bookingId: insertedBookings[0].id,
        contractType: 'individual',
        serviceType: 'wedding',
        status: 'signed',
        title: 'Wedding Photography Agreement - Chen Wedding',
        templateContent: `WEDDING PHOTOGRAPHY AGREEMENT

Client: Emily & Michael Chen
Event Date: February 14, 2025
Location: Lanikai Beach, Kailua, Hawaii

SERVICES PROVIDED:
- 8 hours of wedding photography coverage
- Professional editing of 500+ images
- Online gallery with download access
- Print release for personal use
- FAA-certified drone photography

PAYMENT TERMS:
- Total Amount: $2,850.00
- Retainer: $1,000.00 (due upon signing)
- Balance: $1,850.00 (due 30 days before event)

CANCELLATION POLICY:
Retainer is non-refundable. Full refund available if photographer cancels.

USAGE RIGHTS:
Client receives personal usage rights. Commercial usage requires separate agreement.

By signing below, both parties agree to the terms outlined in this contract.`,
        sessionDate: new Date('2025-02-14'),
        location: 'Lanikai Beach, Kailua, HI',
        packageType: 'Premium Wedding Package',
        totalAmount: 2850.00,
        retainerAmount: 1000.00,
        balanceAmount: 1850.00,
        paymentTerms: 'Retainer due upon signing, balance due 30 days before event',
        deliverables: '500+ edited images, online gallery, print release',
        timeline: '4-6 weeks for final gallery delivery',
        usageRights: 'Personal use only, commercial usage requires separate agreement',
        cancellationPolicy: 'Retainer non-refundable, full refund if photographer cancels',
        clientSignedAt: new Date('2025-01-10'),
        isFullySigned: true
      },
      {
        clientId: insertedClients[1].id,
        bookingId: insertedBookings[1].id,
        contractType: 'individual',
        serviceType: 'portrait',
        status: 'sent',
        title: 'Family Portrait Agreement - Johnson Family',
        templateContent: `FAMILY PORTRAIT PHOTOGRAPHY AGREEMENT

Client: Sarah Johnson
Session Date: January 20, 2025
Location: Kapiolani Park, Honolulu, Hawaii

SERVICES PROVIDED:
- 2-hour family portrait session
- Professional editing of 50+ images
- Online gallery with download access
- Print release for personal use

PAYMENT TERMS:
- Total Amount: $450.00
- Payment due upon session completion

USAGE RIGHTS:
Client receives personal usage rights for all edited images.

By signing below, both parties agree to the terms outlined in this contract.`,
        sessionDate: new Date('2025-01-20'),
        location: 'Kapiolani Park, Honolulu, HI',
        packageType: 'Family Portrait Session',
        totalAmount: 450.00,
        retainerAmount: 0.00,
        balanceAmount: 450.00,
        paymentTerms: 'Payment due upon session completion',
        deliverables: '50+ edited images, online gallery',
        timeline: '2-3 weeks for final gallery delivery',
        usageRights: 'Personal use only',
        cancellationPolicy: '48-hour notice required for rescheduling'
      }
    ];

    for (const contract of contractData) {
      await db.insert(contracts).values(contract);
    }

    // Seed Contact Messages
    console.log('💬 Seeding contact messages...');
    const contactData = [
      {
        name: 'Jessica Martinez',
        email: 'jessica.m@email.com',
        subject: 'Wedding Photography Inquiry',
        message: 'Hi! We\'re planning our wedding for June 2025 at Ko Olina Resort. Would love to discuss your wedding packages and availability. We\'re particularly interested in drone photography for the ceremony.',
        type: 'consultation',
        status: 'pending',
        source: 'website_form',
        category: 'booking_inquiry'
      },
      {
        name: 'Mark Thompson',
        email: 'mark.thompson@realty.com',
        subject: 'Real Estate Photography Services',
        message: 'I represent several luxury properties in Hawaii Kai that need professional photography. Looking for a photographer who can do both interior/exterior and aerial shots. What are your rates for ongoing work?',
        type: 'business_inquiry',
        status: 'responded',
        source: 'referral',
        category: 'business_partnership'
      },
      {
        name: 'Ashley & Brian Lee',
        email: 'leecouple@email.com',
        subject: 'Engagement Photo Session',
        message: 'We just got engaged and would love to do an engagement session before our wedding next year. We\'re thinking Diamond Head or Makapuu Lighthouse for the backdrop. When is your earliest availability?',
        type: 'consultation',
        status: 'pending',
        source: 'instagram',
        category: 'booking_inquiry'
      },
      {
        name: 'Hawaii Tourism Board',
        email: 'marketing@hawaiitourism.org',
        subject: 'Commercial Photography Project',
        message: 'We\'re working on a new tourism campaign and would like to discuss hiring you for lifestyle and landscape photography showcasing Hawaii\'s beauty. This would be a multi-day shoot across multiple islands.',
        type: 'business_inquiry',
        status: 'in_progress',
        source: 'direct_contact',
        category: 'commercial_project'
      },
      {
        name: 'Rachel Kim',
        email: 'rachel.kim@company.com',
        subject: 'Corporate Headshots',
        message: 'Our company needs professional headshots for 15 employees. Would prefer to have them done in our Honolulu office if possible. What would be the cost for a group booking?',
        type: 'business_inquiry',
        status: 'pending',
        source: 'google_search',
        category: 'corporate_booking'
      }
    ];

    for (const contact of contactData) {
      await db.insert(contactMessages).values(contact);
    }

    // Seed some invoices
    console.log('💰 Seeding invoices...');
    const invoiceData = [
      {
        bookingId: insertedBookings[2].id, // Completed real estate booking
        clientId: insertedClients[2].id,
        invoiceNumber: 'CC-2025-001',
        amount: 523.56,
        status: 'paid',
        dueDate: new Date('2025-01-25'),
        paidAt: new Date('2025-01-19'),
        items: [
          {
            description: 'Real Estate Photography - Luxury Ocean View Property',
            quantity: 1,
            rate: 350.00,
            amount: 350.00
          },
          {
            description: 'Twilight Photography Session',
            quantity: 1,
            rate: 150.00,
            amount: 150.00
          }
        ],
        subtotal: 500.00,
        tax: 23.56,
        total: 523.56,
        notes: 'Thank you for choosing CapturedCCollective for your real estate photography needs.'
      }
    ];

    for (const invoice of invoiceData) {
      await db.insert(invoices).values(invoice);
    }

    // Note: AI Chat sessions table not created yet, skipping for now

    console.log('✅ Database seeding completed successfully!');
    console.log(`
📊 Seeded Data Summary:
- ${insertedServices.length} Photography Services
- ${insertedClients.length} Clients  
- ${insertedBookings.length} Bookings
- ${galleryData.length} Gallery Images
- ${contractData.length} Contracts
- ${contactData.length} Contact Messages
- ${invoiceData.length} Invoices
    `);

    return {
      success: true,
      summary: {
        services: insertedServices.length,
        clients: insertedClients.length,
        bookings: insertedBookings.length,
        galleryImages: galleryData.length,
        contracts: contractData.length,
        contactMessages: contactData.length,
        invoices: invoiceData.length
      }
    };

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

export { seedDatabase };