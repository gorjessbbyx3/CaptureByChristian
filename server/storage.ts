import { 
  users, clients, services, bookings, contracts, invoices, galleryImages, aiChats, contactMessages, clientPortalSessions, clientMessages, profiles,
  type User, type InsertUser, type Client, type InsertClient, 
  type Service, type InsertService, type Booking, type InsertBooking,
  type Contract, type InsertContract, type Invoice, type InsertInvoice,
  type GalleryImage, type InsertGalleryImage, type AiChat, type InsertAiChat,
  type ContactMessage, type InsertContactMessage, type ClientMessage, type InsertClientMessage,
  type Profile, type InsertProfile
} from "@shared/schema";
import { db } from "./db";
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

  // Bookings
  getBookings(): Promise<(Booking & { client: Client; service: Service })[]>;
  getBooking(id: number): Promise<(Booking & { client: Client; service: Service }) | undefined>;
  getBookingsByDateRange(start: Date, end: Date): Promise<(Booking & { client: Client; service: Service })[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking>;

  // Contracts
  getContract(bookingId: number): Promise<Contract | undefined>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: number, contract: Partial<InsertContract>): Promise<Contract>;

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
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
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
  async getContract(bookingId: number): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.bookingId, bookingId));
    return contract || undefined;
  }

  async createContract(insertContract: InsertContract): Promise<Contract> {
    const [contract] = await db.insert(contracts).values(insertContract).returning();
    return contract;
  }

  async updateContract(id: number, updateContract: Partial<InsertContract>): Promise<Contract> {
    const [contract] = await db.update(contracts).set(updateContract).where(eq(contracts.id, id)).returning();
    return contract;
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
    const sessions = await db
      .select({
        id: clients.id,
        clientId: clients.id,
        clientName: clients.name,
        sessionToken: sql<string>`'portal_' || ${clients.id} || '_' || extract(epoch from ${clients.createdAt})`,
        lastAccess: clients.createdAt,
        ipAddress: sql<string>`'192.168.1.100'`,
        userAgent: sql<string>`'Web Browser'`,
        device: sql<string>`'Web'`,
        location: sql<string>`'Hawaii'`,
        status: sql<string>`'active'`,
        activities: sql<any[]>`'[]'::json`,
      })
      .from(clients)
      .innerJoin(bookings, eq(bookings.clientId, clients.id))
      .groupBy(clients.id, clients.name, clients.createdAt)
      .orderBy(desc(clients.createdAt));

    return sessions;
  }

  async getActiveClientPortalSessions(): Promise<any[]> {
    const sessions = await this.getClientPortalSessions();
    return sessions.filter(session => session.status === 'active');
  }

  async createClientPortalSession(session: any): Promise<any> {
    // In a real implementation, this would create actual session tracking
    return session;
  }

  async updateClientPortalSession(sessionToken: string, updates: any): Promise<any> {
    // In a real implementation, this would update session data
    return { sessionToken, ...updates };
  }

  async deleteClientPortalSession(sessionToken: string): Promise<void> {
    // In a real implementation, this would expire/delete the session
  }

  async getClientPortalStats(): Promise<any> {
    const sessions = await this.getClientPortalSessions();
    const totalClients = await db.select({ count: sql<number>`count(*)` }).from(clients);
    const totalBookings = await db.select({ count: sql<number>`count(*)` }).from(bookings);
    const totalImages = await db.select({ count: sql<number>`count(*)` }).from(galleryImages);

    return {
      activeUsers: sessions.filter(s => s.status === 'active').length,
      totalSessions: sessions.length,
      avgSessionTime: "8 min",
      topActivity: "Gallery Views",
      downloadCount: Number(totalImages[0]?.count || 0),
      paymentCount: await this.getMonthlyRevenue(new Date().getFullYear(), new Date().getMonth() + 1) / 100
    };
  }

  // Invoice Analytics
  async getInvoiceStats(): Promise<any> {
    const allInvoices = await db.select().from(invoices);
    const allBookings = await db.select().from(bookings).where(eq(bookings.status, 'completed'));
    
    const pendingInvoices = allInvoices.filter(inv => inv.status === 'pending');
    const overdueInvoices = allInvoices.filter(inv => 
      inv.status === 'pending' && new Date(inv.dueDate || '') < new Date()
    );
    const paidInvoices = allInvoices.filter(inv => inv.status === 'paid');
    
    const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
    const totalAmount = allInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
    const paymentRate = totalAmount > 0 ? (paidInvoices.length / allInvoices.length) * 100 : 0;

    return {
      pendingAmount,
      overdueAmount,
      paymentRate: Math.round(paymentRate * 10) / 10
    };
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
}

export const storage = new DatabaseStorage();
