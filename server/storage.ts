import {
  users, clients, services, bookings, contracts, invoices, galleryImages, aiChats, contactMessages, clientPortalSessions, clientMessages, profiles,
  integrations, clientCredentials, gallerySelections, products, orders, questionnaires,
  type User, type InsertUser, type Client, type InsertClient,
  type Service, type InsertService, type Booking, type InsertBooking,
  type Contract, type InsertContract, type Invoice, type InsertInvoice,
  type GalleryImage, type InsertGalleryImage, type AiChat, type InsertAiChat,
  type ContactMessage, type InsertContactMessage, type ClientMessage, type InsertClientMessage,
  type Profile, type InsertProfile, type Integration, type InsertIntegration,
  type ClientCredential, type GallerySelection,
  type Product, type InsertProduct, type Order, type InsertOrder, type Questionnaire, type InsertQuestionnaire
} from "@shared/schema.js";
import bcrypt from "bcrypt";
import { db } from "./db.js";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  getClientByEmail(email: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client>;

  // Services
  getServices(): Promise<Service[]>;
  getActiveServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service>;
  deleteService(id: number): Promise<void>;

  // Bookings
  getBookings(): Promise<(Booking & { client: Client; service: Service })[]>;
  getBooking(id: number): Promise<(Booking & { client: Client; service: Service }) | undefined>;
  getBookingsByDateRange(start: Date, end: Date): Promise<(Booking & { client: Client; service: Service })[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking>;

  // Contracts
  getContracts(): Promise<(Contract & { client: Client })[]>;
  getContract(id: number): Promise<(Contract & { client: Client }) | undefined>;
  getContractByBooking(bookingId: number): Promise<Contract | undefined>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: number, contract: Partial<InsertContract>): Promise<Contract>;
  sendContractToPortal(contractId: number): Promise<{ success: boolean; portalLink?: string }>;

  // Invoices
  getInvoice(bookingId: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice>;

  // Gallery
  getGalleryImages(): Promise<GalleryImage[]>;
  getFeaturedImages(): Promise<GalleryImage[]>;
  getImagesByBooking(bookingId: number): Promise<GalleryImage[]>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  updateGalleryImage(id: number, image: Partial<InsertGalleryImage>): Promise<GalleryImage>;
  deleteGalleryImage(id: number): Promise<void>;

  // AI Chats
  getAiChat(sessionId: string): Promise<AiChat | undefined>;
  createAiChat(chat: InsertAiChat): Promise<AiChat>;
  updateAiChat(sessionId: string, chat: Partial<InsertAiChat>): Promise<AiChat>;

  // Analytics
  getMonthlyRevenue(year: number, month: number): Promise<number>;
  getBookingStats(): Promise<{
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    monthlyRevenue: number;
  }>;

  // Contact Messages
  getContactMessages(): Promise<ContactMessage[]>;
  getContactMessage(id: number): Promise<ContactMessage | undefined>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  updateContactMessage(id: number, message: Partial<InsertContactMessage>): Promise<ContactMessage>;
  deleteContactMessage(id: number): Promise<void>;

  // Client Messages
  getClientMessages(clientId: number): Promise<ClientMessage[]>;
  createClientMessage(message: InsertClientMessage): Promise<ClientMessage>;

  // Profile Management
  getProfile(): Promise<Profile | undefined>;
  updateProfile(profile: Partial<InsertProfile>): Promise<Profile>;
  createProfile(profile: InsertProfile): Promise<Profile>;

  // Client Portal Sessions
  getClientPortalSessions(): Promise<any[]>;
  getActiveClientPortalSessions(): Promise<any[]>;
  createClientPortalSession(session: any): Promise<any>;
  updateClientPortalSession(sessionToken: string, updates: any): Promise<any>;
  deleteClientPortalSession(sessionToken: string): Promise<void>;
  getClientPortalStats(): Promise<any>;

  // Invoice Analytics
  getInvoiceStats(): Promise<any>;
  getBusinessKPIs(): Promise<any>;
  getClientMetrics(): Promise<any>;

  // Integrations
  getIntegrations(): Promise<Integration[]>;
  getIntegration(integrationId: string): Promise<Integration | undefined>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(integrationId: string, integration: Partial<InsertIntegration>): Promise<Integration>;

  // Client Credentials
  getClientCredentials(): Promise<(ClientCredential & { client: Client })[]>;
  getClientCredential(clientId: number): Promise<ClientCredential | undefined>;
  setClientPassword(clientId: number, password: string): Promise<ClientCredential>;
  verifyClientPassword(clientId: number, password: string): Promise<boolean>;
  toggleClientPortalAccess(clientId: number, enabled: boolean): Promise<ClientCredential>;
  updateClientLastLogin(clientId: number): Promise<void>;
  setMagicLinkToken(clientId: number, token: string, expiry: Date): Promise<void>;
  clearMagicLinkToken(clientId: number): Promise<void>;

  // Gallery Selections
  getGallerySelections(galleryId: string, clientId: number): Promise<GallerySelection | undefined>;
  saveGallerySelections(galleryId: string, clientId: number, favorites: string[], comments: Record<string, string>): Promise<GallerySelection>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Orders
  getOrders(): Promise<(Order & { client: Client })[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order>;

  // Questionnaires
  getQuestionnaires(): Promise<Questionnaire[]>;
  getQuestionnaire(id: number): Promise<Questionnaire | undefined>;
  createQuestionnaire(questionnaire: InsertQuestionnaire): Promise<Questionnaire>;
  updateQuestionnaire(id: number, questionnaire: Partial<InsertQuestionnaire>): Promise<Questionnaire>;
  deleteQuestionnaire(id: number): Promise<void>;

  // Portal Session Management
  clearAllPortalSessions(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Look up by actual username column
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Clients
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async getClientByEmail(email: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.email, email));
    return client || undefined;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }

  async updateClient(id: number, updateClient: Partial<InsertClient>): Promise<Client> {
    const [client] = await db.update(clients).set(updateClient).where(eq(clients.id, id)).returning();
    return client;
  }

  // Services
  async getServices(): Promise<Service[]> {
    return await db.select().from(services).orderBy(services.category, services.name);
  }

  async getActiveServices(): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.active, true)).orderBy(services.category, services.name);
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(insertService).returning();
    return service;
  }

  async updateService(id: number, updateService: Partial<InsertService>): Promise<Service> {
    const [service] = await db.update(services).set(updateService).where(eq(services.id, id)).returning();
    return service;
  }

  async deleteService(id: number): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  // Bookings
  async getBookings(): Promise<(Booking & { client: Client; service: Service })[]> {
    return await db
      .select()
      .from(bookings)
      .leftJoin(clients, eq(bookings.clientId, clients.id))
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .orderBy(desc(bookings.date))
      .then(rows =>
        rows.map(row => ({
          ...row.bookings,
          client: row.clients!,
          service: row.services!,
        }))
      );
  }

  async getBooking(id: number): Promise<(Booking & { client: Client; service: Service }) | undefined> {
    const [result] = await db
      .select()
      .from(bookings)
      .leftJoin(clients, eq(bookings.clientId, clients.id))
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .where(eq(bookings.id, id));

    if (!result) return undefined;

    return {
      ...result.bookings,
      client: result.clients!,
      service: result.services!,
    };
  }

  async getBookingsByDateRange(start: Date, end: Date): Promise<(Booking & { client: Client; service: Service })[]> {
    return await db
      .select()
      .from(bookings)
      .leftJoin(clients, eq(bookings.clientId, clients.id))
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .where(and(gte(bookings.date, start), lte(bookings.date, end)))
      .orderBy(bookings.date)
      .then(rows =>
        rows.map(row => ({
          ...row.bookings,
          client: row.clients!,
          service: row.services!,
        }))
      );
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    return booking;
  }

  async updateBooking(id: number, updateBooking: Partial<InsertBooking>): Promise<Booking> {
    const [booking] = await db.update(bookings).set(updateBooking).where(eq(bookings.id, id)).returning();
    return booking;
  }

  // Contracts
  async getContracts(): Promise<(Contract & { client: Client })[]> {
    try {
      const contractsData = await db
        .select()
        .from(contracts)
        .leftJoin(clients, eq(contracts.clientId, clients.id))
        .orderBy(desc(contracts.createdAt));

      return contractsData.map(row => ({
        ...row.contracts,
        client: row.clients!
      }));
    } catch (error) {
      console.error("Error fetching contracts:", error);
      // Return empty array if table doesn't exist or has schema issues
      return [];
    }
  }

  async getContract(id: number): Promise<(Contract & { client: Client }) | undefined> {
    try {
      const [contractData] = await db
        .select()
        .from(contracts)
        .leftJoin(clients, eq(contracts.clientId, clients.id))
        .where(eq(contracts.id, id));

      if (!contractData) return undefined;

      return {
        ...contractData.contracts,
        client: contractData.clients!
      };
    } catch (error) {
      console.error("Error fetching contract:", error);
      return undefined;
    }
  }

  async getContractByBooking(bookingId: number): Promise<Contract | undefined> {
    const [contract] = await db
      .select()
      .from(contracts)
      .where(eq(contracts.bookingId, bookingId));
    return contract || undefined;
  }



  async createContract(insertContract: InsertContract): Promise<Contract> {
    const [contract] = await db
      .insert(contracts)
      .values(insertContract)
      .returning();
    return contract;
  }

  async updateContract(id: number, updateContract: Partial<InsertContract>): Promise<Contract> {
    const [contract] = await db
      .update(contracts)
      .set({ ...updateContract, updatedAt: new Date() })
      .where(eq(contracts.id, id))
      .returning();
    return contract;
  }

  async sendContractToPortal(contractId: number): Promise<{ success: boolean; portalLink?: string }> {
    // Generate a secure token for client portal access
    const portalToken = `contract_${contractId}_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    // Update contract with portal token and sent timestamp
    await db
      .update(contracts)
      .set({
        status: 'sent',
        portalAccessToken: portalToken,
        signatureRequestSent: new Date(),
        updatedAt: new Date()
      })
      .where(eq(contracts.id, contractId));

    // Create portal link
    const portalLink = `${process.env.REPLIT_DOMAINS || 'localhost:3000'}/client-portal/contract/${portalToken}`;

    return {
      success: true,
      portalLink
    };
  }

  // Invoices
  async getInvoice(bookingId: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.bookingId, bookingId));
    return invoice || undefined;
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db.insert(invoices).values(insertInvoice).returning();
    return invoice;
  }

  async updateInvoice(id: number, updateInvoice: Partial<InsertInvoice>): Promise<Invoice> {
    const [invoice] = await db.update(invoices).set(updateInvoice).where(eq(invoices.id, id)).returning();
    return invoice;
  }

  // Gallery
  async getGalleryImages(): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages).orderBy(desc(galleryImages.uploadedAt));
  }

  async getFeaturedImages(): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages).where(eq(galleryImages.featured, true)).orderBy(desc(galleryImages.uploadedAt));
  }

  async getImagesByBooking(bookingId: number): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages).where(eq(galleryImages.bookingId, bookingId)).orderBy(desc(galleryImages.uploadedAt));
  }

  async createGalleryImage(insertImage: InsertGalleryImage): Promise<GalleryImage> {
    const [image] = await db.insert(galleryImages).values(insertImage).returning();
    return image;
  }

  async updateGalleryImage(id: number, updateImage: Partial<InsertGalleryImage>): Promise<GalleryImage> {
    const [image] = await db.update(galleryImages).set(updateImage).where(eq(galleryImages.id, id)).returning();
    return image;
  }

  async deleteGalleryImage(id: number): Promise<void> {
    await db.delete(galleryImages).where(eq(galleryImages.id, id));
  }

  // AI Chats
  async getAiChat(sessionId: string): Promise<AiChat | undefined> {
    const [chat] = await db.select().from(aiChats).where(eq(aiChats.sessionId, sessionId));
    return chat || undefined;
  }

  async createAiChat(insertChat: InsertAiChat): Promise<AiChat> {
    const [chat] = await db.insert(aiChats).values(insertChat).returning();
    return chat;
  }

  async updateAiChat(sessionId: string, updateChat: Partial<InsertAiChat>): Promise<AiChat> {
    const [chat] = await db.update(aiChats).set({
      ...updateChat,
      updatedAt: new Date(),
    }).where(eq(aiChats.sessionId, sessionId)).returning();
    return chat;
  }

  // Analytics
  async getMonthlyRevenue(year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const [result] = await db
      .select({ total: sql<number>`sum(${bookings.totalPrice})` })
      .from(bookings)
      .where(
        and(
          gte(bookings.date, startDate),
          lte(bookings.date, endDate),
          eq(bookings.status, 'confirmed')
        )
      );

    return Number(result?.total || 0);
  }

  async getBookingStats(): Promise<{
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    monthlyRevenue: number;
  }> {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const [totalBookings] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings);

    const [pendingBookings] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(eq(bookings.status, 'pending'));

    const [confirmedBookings] = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(eq(bookings.status, 'confirmed'));

    const monthlyRevenue = await this.getMonthlyRevenue(currentYear, currentMonth);

    return {
      totalBookings: Number(totalBookings?.count || 0),
      pendingBookings: Number(pendingBookings?.count || 0),
      confirmedBookings: Number(confirmedBookings?.count || 0),
      monthlyRevenue,
    };
  }

  // Contact Messages
  async getContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return message || undefined;
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const [message] = await db.insert(contactMessages).values(insertMessage).returning();
    return message;
  }

  async updateContactMessage(id: number, updateMessage: Partial<InsertContactMessage>): Promise<ContactMessage> {
    const [message] = await db.update(contactMessages)
      .set(updateMessage)
      .where(eq(contactMessages.id, id))
      .returning();
    return message;
  }

  async deleteContactMessage(id: number): Promise<void> {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
  }

  // Client Portal Sessions
  async getClientPortalSessions(): Promise<any[]> {
    return await db.select().from(clientPortalSessions).orderBy(desc(clientPortalSessions.createdAt));
  }

  async getActiveClientPortalSessions(): Promise<any[]> {
    return await db.select().from(clientPortalSessions)
      .where(gte(clientPortalSessions.expiresAt, new Date()));
  }

  async createClientPortalSession(session: any): Promise<any> {
    const [created] = await db.insert(clientPortalSessions).values(session).returning();
    return created;
  }

  async updateClientPortalSession(sessionToken: string, updates: any): Promise<any> {
    const [updated] = await db.update(clientPortalSessions)
      .set(updates)
      .where(eq(clientPortalSessions.sessionToken, sessionToken))
      .returning();
    return updated;
  }

  async deleteClientPortalSession(sessionToken: string): Promise<void> {
    await db.delete(clientPortalSessions)
      .where(eq(clientPortalSessions.sessionToken, sessionToken));
  }

  async getClientPortalStats(): Promise<any> {
    // Get actual portal session data
    const allSessions = await db.select().from(clientPortalSessions);
    const activeSessions = allSessions.filter((s: any) => s.status === 'active');

    // Calculate total logins (session starts)
    const totalLogins = allSessions.length;

    // Calculate access rate (active vs total clients)
    const totalClientsResult = await db.select({ count: sql<number>`count(*)` }).from(clients);
    const totalClients = totalClientsResult[0]?.count || 0;
    const accessRate = totalClients > 0 ? Math.round((activeSessions.length / totalClients) * 100) : 0;

    // Count downloads from activity logs
    const downloadCount = allSessions.reduce((sum: number, session: any) => {
      const activities = session.activityLog || [];
      return sum + activities.filter((activity: any) => activity.type === 'download').length;
    }, 0);

    // Calculate average rating from sessions with ratings
    const sessionsWithRatings = allSessions.filter((s: any) => s.rating && s.rating > 0);
    const avgRating = sessionsWithRatings.length > 0
      ? (sessionsWithRatings.reduce((sum: number, s: any) => sum + (s.rating || 0), 0) / sessionsWithRatings.length).toFixed(1)
      : null;

    return {
      activeUsers: activeSessions.length,
      totalSessions: totalLogins,
      totalLogins: totalLogins,
      accessRate: `${accessRate}%`,
      avgSessionTime: "0:00", // Would need session duration tracking
      topActivity: downloadCount > 0 ? "Photo downloads" : "Gallery viewing",
      downloadCount: downloadCount,
      paymentCount: 0, // Would need payment tracking integration
      avgRating: avgRating || "No ratings yet"
    };
  }

  // Invoice Analytics
  async getInvoiceStats(): Promise<any> {
    try {
      const allBookings = await db.select().from(bookings);

      // Calculate stats from actual bookings since no separate invoices table exists yet
      const completedBookings = allBookings.filter(b => b.status === 'completed');
      const totalRevenue = completedBookings.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);

      return {
        totalRevenue,
        pendingAmount: 0, // No separate invoice tracking yet
        overdueAmount: 0, // No separate invoice tracking yet
        paymentRate: completedBookings.length > 0 ? 100 : 0 // All completed bookings are considered paid
      };
    } catch (error) {
      console.error("Invoice stats error:", error);
      return {
        totalRevenue: 0,
        pendingAmount: 0,
        overdueAmount: 0,
        paymentRate: 0
      };
    }
  }

  async getBusinessKPIs(): Promise<any> {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const totalClients = await db.select({ count: sql<number>`count(*)` }).from(clients);
    const monthlyRevenue = await this.getMonthlyRevenue(currentYear, currentMonth);
    const totalBookings = await db.select({ count: sql<number>`count(*)` }).from(bookings);
    const completedBookings = await db.select({ count: sql<number>`count(*)` })
      .from(bookings).where(eq(bookings.status, 'completed'));

    return {
      monthlyRecurringRevenue: monthlyRevenue,
      totalClients: Number(totalClients[0]?.count || 0),
      totalBookings: Number(totalBookings[0]?.count || 0),
      completionRate: totalBookings[0]?.count > 0 ?
        (Number(completedBookings[0]?.count || 0) / Number(totalBookings[0]?.count)) * 100 : 0
    };
  }

  async getClientMetrics(): Promise<any> {
    const allClients = await db.select().from(clients);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newClientsThisMonth = allClients.filter(client =>
      new Date(client.createdAt) >= thirtyDaysAgo
    );

    const clientsWithMultipleBookings = await db
      .select({ clientId: bookings.clientId, count: sql<number>`count(*)` })
      .from(bookings)
      .groupBy(bookings.clientId)
      .having(sql`count(*) > 1`);

    const avgLifetimeValue = await this.getMonthlyRevenue(new Date().getFullYear(), new Date().getMonth() + 1) / allClients.length || 0;

    return {
      totalClients: allClients.length,
      newThisMonth: newClientsThisMonth.length,
      repeatClients: clientsWithMultipleBookings.length,
      avgLifetimeValue: Math.round(avgLifetimeValue)
    };
  }

  async getClientMessages(clientId: number): Promise<ClientMessage[]> {
    const messages = await db.select().from(clientMessages)
      .where(eq(clientMessages.clientId, clientId))
      .orderBy(desc(clientMessages.createdAt));
    return messages;
  }

  async createClientMessage(insertMessage: InsertClientMessage): Promise<ClientMessage> {
    const [message] = await db.insert(clientMessages).values(insertMessage).returning();
    return message;
  }

  async getProfile(): Promise<Profile | undefined> {
    const profileList = await db.select().from(profiles).where(eq(profiles.isActive, true)).limit(1);
    return profileList[0];
  }

  async updateProfile(updateProfile: Partial<InsertProfile>): Promise<Profile> {
    const existingProfile = await this.getProfile();
    if (existingProfile) {
      const [profile] = await db.update(profiles)
        .set({ ...updateProfile, updatedAt: new Date() })
        .where(eq(profiles.id, existingProfile.id))
        .returning();
      return profile;
    } else {
      // Create new profile if none exists
      return this.createProfile(updateProfile as InsertProfile);
    }
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const [profile] = await db.insert(profiles).values(insertProfile).returning();
    return profile;
  }

  // Integrations
  async getIntegrations(): Promise<Integration[]> {
    const existingIntegrations = await db.select().from(integrations);
    
    // Ensure default integrations exist
    const defaultIntegrations = [
      { integrationId: 'stripe', name: 'Stripe' },
      { integrationId: 'google-calendar', name: 'Google Calendar' },
      { integrationId: 'mailchimp', name: 'Mailchimp' }
    ];

    for (const def of defaultIntegrations) {
      const exists = existingIntegrations.find(i => i.integrationId === def.integrationId);
      if (!exists) {
        await db.insert(integrations).values({
          integrationId: def.integrationId,
          name: def.name,
          isConnected: false,
          isActive: false,
          status: 'disconnected'
        });
      }
    }

    return await db.select().from(integrations).orderBy(integrations.name);
  }

  async getIntegration(integrationId: string): Promise<Integration | undefined> {
    const [integration] = await db.select().from(integrations).where(eq(integrations.integrationId, integrationId));
    return integration || undefined;
  }

  async createIntegration(insertIntegration: InsertIntegration): Promise<Integration> {
    const [integration] = await db.insert(integrations).values(insertIntegration).returning();
    return integration;
  }

  async updateIntegration(integrationId: string, updateData: Partial<InsertIntegration>): Promise<Integration> {
    const [integration] = await db.update(integrations)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(integrations.integrationId, integrationId))
      .returning();
    return integration;
  }

  // Client Credentials
  async getClientCredentials(): Promise<(ClientCredential & { client: Client })[]> {
    const allClients = await this.getClients();
    const result: (ClientCredential & { client: Client })[] = [];

    for (const client of allClients) {
      let credential = await this.getClientCredential(client.id);
      
      // Create credential record if it doesn't exist
      if (!credential) {
        const [newCredential] = await db.insert(clientCredentials).values({
          clientId: client.id,
          portalAccess: true
        }).returning();
        credential = newCredential;
      }

      result.push({
        ...credential,
        client
      });
    }

    return result;
  }

  async getClientCredential(clientId: number): Promise<ClientCredential | undefined> {
    const [credential] = await db.select().from(clientCredentials).where(eq(clientCredentials.clientId, clientId));
    return credential || undefined;
  }

  async setClientPassword(clientId: number, password: string): Promise<ClientCredential> {
    const passwordHash = await bcrypt.hash(password, 10);
    
    let credential = await this.getClientCredential(clientId);
    
    if (credential) {
      const [updated] = await db.update(clientCredentials)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(clientCredentials.clientId, clientId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(clientCredentials).values({
        clientId,
        passwordHash,
        portalAccess: true
      }).returning();
      return created;
    }
  }

  async verifyClientPassword(clientId: number, password: string): Promise<boolean> {
    const credential = await this.getClientCredential(clientId);
    if (!credential || !credential.passwordHash) {
      return false;
    }
    return bcrypt.compare(password, credential.passwordHash);
  }

  async toggleClientPortalAccess(clientId: number, enabled: boolean): Promise<ClientCredential> {
    let credential = await this.getClientCredential(clientId);
    
    if (credential) {
      const [updated] = await db.update(clientCredentials)
        .set({ portalAccess: enabled, updatedAt: new Date() })
        .where(eq(clientCredentials.clientId, clientId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(clientCredentials).values({
        clientId,
        portalAccess: enabled
      }).returning();
      return created;
    }
  }

  async updateClientLastLogin(clientId: number): Promise<void> {
    let credential = await this.getClientCredential(clientId);
    
    if (credential) {
      await db.update(clientCredentials)
        .set({ lastLogin: new Date(), updatedAt: new Date() })
        .where(eq(clientCredentials.clientId, clientId));
    } else {
      await db.insert(clientCredentials).values({
        clientId,
        lastLogin: new Date(),
        portalAccess: true
      });
    }
  }

  async setMagicLinkToken(clientId: number, token: string, expiry: Date): Promise<void> {
    let credential = await this.getClientCredential(clientId);
    
    if (credential) {
      await db.update(clientCredentials)
        .set({ magicLinkToken: token, magicLinkExpiry: expiry, updatedAt: new Date() })
        .where(eq(clientCredentials.clientId, clientId));
    } else {
      await db.insert(clientCredentials).values({
        clientId,
        magicLinkToken: token,
        magicLinkExpiry: expiry,
        portalAccess: true
      });
    }
  }

  async clearMagicLinkToken(clientId: number): Promise<void> {
    await db.update(clientCredentials)
      .set({ magicLinkToken: null, magicLinkExpiry: null, updatedAt: new Date() })
      .where(eq(clientCredentials.clientId, clientId));
  }

  // Gallery Selections
  async getGallerySelections(galleryId: string, clientId: number): Promise<GallerySelection | undefined> {
    const [selection] = await db.select().from(gallerySelections)
      .where(and(
        eq(gallerySelections.galleryId, galleryId),
        eq(gallerySelections.clientId, clientId)
      ));
    return selection || undefined;
  }

  async saveGallerySelections(galleryId: string, clientId: number, favorites: string[], comments: Record<string, string>): Promise<GallerySelection> {
    const existing = await this.getGallerySelections(galleryId, clientId);
    
    if (existing) {
      const [updated] = await db.update(gallerySelections)
        .set({ favorites, comments, updatedAt: new Date() })
        .where(eq(gallerySelections.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(gallerySelections).values({
        galleryId,
        clientId,
        favorites,
        comments
      }).returning();
      return created;
    }
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.name);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updateProduct: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db.update(products).set(updateProduct).where(eq(products.id, id)).returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Orders
  async getOrders(): Promise<(Order & { client: Client })[]> {
    return await db
      .select()
      .from(orders)
      .leftJoin(clients, eq(orders.clientId, clients.id))
      .orderBy(desc(orders.createdAt))
      .then(rows =>
        rows.map(row => ({
          ...row.orders,
          client: row.clients!
        }))
      );
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async updateOrder(id: number, updateOrder: Partial<InsertOrder>): Promise<Order> {
    const [order] = await db.update(orders).set(updateOrder).where(eq(orders.id, id)).returning();
    return order;
  }

  // Questionnaires
  async getQuestionnaires(): Promise<Questionnaire[]> {
    return await db.select().from(questionnaires).orderBy(desc(questionnaires.createdAt));
  }

  async getQuestionnaire(id: number): Promise<Questionnaire | undefined> {
    const [questionnaire] = await db.select().from(questionnaires).where(eq(questionnaires.id, id));
    return questionnaire || undefined;
  }

  async createQuestionnaire(insertQuestionnaire: InsertQuestionnaire): Promise<Questionnaire> {
    const [questionnaire] = await db.insert(questionnaires).values(insertQuestionnaire).returning();
    return questionnaire;
  }

  async updateQuestionnaire(id: number, updateQuestionnaire: Partial<InsertQuestionnaire>): Promise<Questionnaire> {
    const [questionnaire] = await db.update(questionnaires).set(updateQuestionnaire).where(eq(questionnaires.id, id)).returning();
    return questionnaire;
  }

  async deleteQuestionnaire(id: number): Promise<void> {
    await db.delete(questionnaires).where(eq(questionnaires.id, id));
  }

  // Portal Session Management
  async clearAllPortalSessions(): Promise<void> {
    await db.delete(clientPortalSessions);
  }
}

export const storage = new DatabaseStorage();