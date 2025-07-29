import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("admin"), // admin, client
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  notes: text("notes"),
  tags: text("tags").array(),
  status: text("status").default("lead").notNull(), // lead, qualified, booked, repeat, archived
  leadSource: text("lead_source"), // instagram, website, referral, tiktok, google
  leadScore: integer("lead_score").default(0),
  instagramHandle: text("instagram_handle"),
  anniversaryDate: text("anniversary_date"),
  preferredCommunication: text("preferred_communication").default("email"), // email, text, phone
  timezone: text("timezone").default("America/New_York"),
  lastContact: timestamp("last_contact"),
  nextFollowUp: timestamp("next_follow_up"),
  lifetimeValue: decimal("lifetime_value", { precision: 10, scale: 2 }).default("0.00"),
  referralSource: text("referral_source"),
  customFields: json("custom_fields").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(), // minutes
  category: text("category").notNull(),
  active: boolean("active").default(true),
  addOns: json("add_ons").$type<Array<{id: string, name: string, price: number}>>(),
  images: text("images").array(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  serviceId: integer("service_id").references(() => services.id).notNull(),
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull(), // minutes
  location: text("location"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  depositPaid: boolean("deposit_paid").default(false),
  status: text("status").notNull().default("pending"), // pending, confirmed, completed, cancelled
  notes: text("notes"),
  addOns: json("add_ons").$type<Array<{id: string, name: string, price: number}>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  bookingId: integer("bookingId").references(() => bookings.id),
  clientId: integer("clientId").references(() => clients.id).notNull(),
  contractType: text("contractType").notNull(), // 'individual', 'business'
  serviceType: text("serviceType"), // 'portrait', 'wedding', 'commercial', etc.
  status: text("status").notNull().default("draft"), // 'draft', 'sent', 'signed', 'completed', 'cancelled'
  title: text("title").notNull(),
  templateContent: text("templateContent").notNull(),
  signedContent: text("signedContent"),
  sessionDate: timestamp("sessionDate"),
  location: text("location"),
  packageType: text("packageType"),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }),
  retainerAmount: decimal("retainerAmount", { precision: 10, scale: 2 }),
  balanceAmount: decimal("balanceAmount", { precision: 10, scale: 2 }),
  paymentTerms: text("paymentTerms"),
  deliverables: text("deliverables"),
  timeline: text("timeline"),
  usageRights: text("usageRights"),
  cancellationPolicy: text("cancellationPolicy"),
  additionalTerms: text("additionalTerms"),
  clientSignature: text("clientSignature"), // base64 client signature
  clientSignedAt: timestamp("clientSignedAt"),
  clientIpAddress: text("clientIpAddress"),
  photographerSignature: text("photographerSignature"),
  photographerSignedAt: timestamp("photographerSignedAt"),
  signatureRequestSent: timestamp("signatureRequestSent"),
  portalAccessToken: text("portalAccessToken"), // For client portal access
  isFullySigned: boolean("isFullySigned").default(false),
  signatureMetadata: json("signatureMetadata").$type<{
    clientDevice?: string;
    clientUserAgent?: string;
    signatureMethod?: 'electronic' | 'digital';
    witnessRequired?: boolean;
    notarizedRequired?: boolean;
  }>(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidAt: timestamp("paid_at"),
  status: text("status").notNull().default("pending"), // pending, paid, overdue
  paymentMethod: text("payment_method"),
});

export const galleryImages = pgTable("gallery_images", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  category: text("category"),
  tags: text("tags").array(),
  aiAnalysis: json("ai_analysis").$type<{
    emotions?: string[];
    style?: string;
    composition?: string;
    quality?: number;
  }>(),
  featured: boolean("featured").default(false),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const aiChats = pgTable("ai_chats", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  clientEmail: text("client_email"),
  messages: json("messages").$type<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>>().notNull(),
  bookingData: json("booking_data").$type<{
    serviceType?: string;
    date?: string;
    location?: string;
    budget?: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Comprehensive CRM Enhancement Tables
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  source: text("source").notNull(),
  medium: text("medium"),
  campaign: text("campaign"),
  formData: json("form_data"),
  score: integer("score").default(0),
  temperature: text("temperature").default("cold"),
  qualification: text("qualification"),
  assignedTo: integer("assigned_to").references(() => users.id),
  convertedAt: timestamp("converted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communicationLog = pgTable("communication_log", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(),
  direction: text("direction").notNull(),
  subject: text("subject"),
  content: text("content"),
  status: text("status"),
  metadata: json("metadata"),
  scheduledFor: timestamp("scheduled_for"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const automationSequences = pgTable("automation_sequences", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  trigger: text("trigger").notNull(),
  active: boolean("active").default(true),
  steps: json("steps").$type<Array<{delay: number, type: string, template: string}>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questionnaires = pgTable("questionnaires", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  serviceType: text("service_type"),
  questions: json("questions").$type<Array<{id: string, type: string, question: string, required: boolean}>>(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clientPortalSessions = pgTable("client_portal_sessions", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  sku: text("sku"),
  variants: json("variants").$type<Array<{name: string, price: number}>>(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  galleryId: integer("gallery_id").references(() => galleryImages.id),
  items: json("items").$type<Array<{productId: number, quantity: number, price: number}>>(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending"),
  shippingAddress: json("shipping_address"),
  trackingNumber: text("tracking_number"),
  fulfilledAt: timestamp("fulfilled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").notNull(),
  permissions: json("permissions").$type<Array<string>>(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").default("unread").notNull(),
  priority: text("priority").default("normal").notNull(),
  source: text("source").default("website").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  aiCategory: text("ai_category").default("general_inquiry").notNull(),
  suggestedResponse: text("suggested_response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clientMessages = pgTable("client_messages", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  message: text("message").notNull(),
  isFromClient: boolean("is_from_client").default(true).notNull(),
  senderName: text("sender_name").notNull(),
  senderEmail: text("sender_email").notNull(),
  status: text("status").default("unread").notNull(), // unread, read, replied
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  bio: text("bio").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  address: text("address").notNull(),
  headshot: text("headshot"), // base64 or URL
  socialMedia: json("social_media").$type<{
    instagram: string;
    facebook: string;
    youtube: string;
  }>().default({ instagram: "", facebook: "", youtube: "" }),
  isActive: boolean("is_active").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const clientsRelations = relations(clients, ({ many }) => ({
  bookings: many(bookings),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  client: one(clients, {
    fields: [bookings.clientId],
    references: [clients.id],
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
  contract: one(contracts),
  invoice: one(invoices),
  galleryImages: many(galleryImages),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  booking: one(bookings, {
    fields: [contracts.bookingId],
    references: [bookings.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  booking: one(bookings, {
    fields: [invoices.bookingId],
    references: [bookings.id],
  }),
}));

export const galleryImagesRelations = relations(galleryImages, ({ one }) => ({
  booking: one(bookings, {
    fields: [galleryImages.bookingId],
    references: [bookings.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

// Contract schema - custom definition to handle date strings properly
export const insertContractSchema = z.object({
  clientId: z.number(),
  contractType: z.enum(['individual', 'business']),
  serviceType: z.string().nullable(),
  title: z.string().min(1),
  templateContent: z.string(),
  sessionDate: z.string().nullable().transform(val => val ? new Date(val) : null),
  location: z.string().nullable(),
  packageType: z.string().nullable(),
  totalAmount: z.string().nullable(),
  retainerAmount: z.string().nullable(),
  balanceAmount: z.string().nullable(),
  paymentTerms: z.string().nullable(),
  deliverables: z.string().nullable(),
  timeline: z.string().nullable(),
  usageRights: z.string().nullable(),
  cancellationPolicy: z.string().nullable(),
  additionalTerms: z.string().nullable(),
  bookingId: z.number().nullable(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
});

export const insertGalleryImageSchema = createInsertSchema(galleryImages).omit({
  id: true,
  uploadedAt: true,
});

export const insertAiChatSchema = createInsertSchema(aiChats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export const insertCommunicationLogSchema = createInsertSchema(communicationLog).omit({
  id: true,
  createdAt: true,
});

export const insertAutomationSequenceSchema = createInsertSchema(automationSequences).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionnaireSchema = createInsertSchema(questionnaires).omit({
  id: true,
  createdAt: true,
});

export const insertClientPortalSessionSchema = createInsertSchema(clientPortalSessions).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
});

export const insertClientMessageSchema = createInsertSchema(clientMessages).omit({
  id: true,
  createdAt: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types - Use Drizzle inferred types for consistency
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = typeof galleryImages.$inferInsert;

export type AiChat = typeof aiChats.$inferSelect;
export type InsertAiChat = typeof aiChats.$inferInsert;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

export type CommunicationLog = typeof communicationLog.$inferSelect;
export type InsertCommunicationLog = typeof communicationLog.$inferInsert;

export type AutomationSequence = typeof automationSequences.$inferSelect;
export type InsertAutomationSequence = typeof automationSequences.$inferInsert;

export type Questionnaire = typeof questionnaires.$inferSelect;
export type InsertQuestionnaire = typeof questionnaires.$inferInsert;

export type ClientPortalSession = typeof clientPortalSessions.$inferSelect;
export type InsertClientPortalSession = typeof clientPortalSessions.$inferInsert;

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

export type ClientMessage = typeof clientMessages.$inferSelect;
export type InsertClientMessage = typeof clientMessages.$inferInsert;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;