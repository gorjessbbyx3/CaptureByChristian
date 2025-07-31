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
  booking_id: integer("booking_id").references(() => bookings.id),
  client_id: integer("client_id").references(() => clients.id).notNull(),
  contract_type: text("contract_type").notNull(), // 'individual', 'business'
  service_type: text("service_type"), // 'portrait', 'wedding', 'commercial', etc.
  status: text("status").notNull().default("draft"), // 'draft', 'sent', 'signed', 'completed', 'cancelled'
  title: text("title").notNull(),
  template_content: text("template_content").notNull(),
  signed_content: text("signed_content"),
  session_date: timestamp("session_date"),
  location: text("location"),
  package_type: text("package_type"),
  total_amount: decimal("total_amount", { precision: 10, scale: 2 }),
  retainer_amount: decimal("retainer_amount", { precision: 10, scale: 2 }),
  balance_amount: decimal("balance_amount", { precision: 10, scale: 2 }),
  payment_terms: text("payment_terms"),
  deliverables: text("deliverables"),
  timeline: text("timeline"),
  usage_rights: text("usage_rights"),
  cancellation_policy: text("cancellation_policy"),
  additional_terms: text("additional_terms"),
  client_signature: text("client_signature"), // base64 client signature
  client_signed_at: timestamp("client_signed_at"),
  client_ip_address: text("client_ip_address"),
  photographer_signature: text("photographer_signature"),
  photographer_signed_at: timestamp("photographer_signed_at"),
  signature_request_sent: timestamp("signature_request_sent"),
  portal_access_token: text("portal_access_token"), // For client portal access
  is_fully_signed: boolean("is_fully_signed").default(false),
  signature_metadata: json("signature_metadata").$type<{
    clientDevice?: string;
    clientUserAgent?: string;
    signatureMethod?: 'electronic' | 'digital';
    witnessRequired?: boolean;
    notarizedRequired?: boolean;
  }>(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  booking_id: integer("booking_id").references(() => bookings.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  due_date: timestamp("due_date").notNull(),
  paid_at: timestamp("paid_at"),
  status: text("status").notNull().default("pending"), // pending, paid, overdue
  payment_method: text("payment_method"),
});

export const galleryImages = pgTable("gallery_images", {
  id: serial("id").primaryKey(),
  booking_id: integer("booking_id").references(() => bookings.id),
  filename: text("filename").notNull(),
  original_name: text("original_name").notNull(),
  url: text("url").notNull(),
  thumbnail_url: text("thumbnail_url"),
  category: text("category"),
  tags: text("tags").array(),
  ai_analysis: json("ai_analysis").$type<{
    emotions?: string[];
    style?: string;
    composition?: string;
    quality?: number;
  }>(),
  featured: boolean("featured").default(false),
  uploaded_at: timestamp("uploaded_at").defaultNow().notNull(),
});

export const aiChats = pgTable("ai_chats", {
  id: serial("id").primaryKey(),
  session_id: text("session_id").notNull(),
  client_email: text("client_email"),
  messages: json("messages").$type<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>>().notNull(),
  booking_data: json("booking_data").$type<{
    serviceType?: string;
    date?: string;
    location?: string;
    budget?: number;
  }>(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
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
  service_type: text("service_type"),
  questions: json("questions").$type<Array<{id: string, type: string, question: string, required: boolean}>>(),
  active: boolean("active").default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const clientPortalSessions = pgTable("client_portal_sessions", {
  id: serial("id").primaryKey(),
  client_id: integer("client_id").references(() => clients.id).notNull(),
  session_token: text("session_token").notNull().unique(),
  expires_at: timestamp("expires_at").notNull(),
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  created_at: timestamp("created_at").defaultNow().notNull(),
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
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  client_id: integer("client_id").references(() => clients.id).notNull(),
  gallery_id: integer("gallery_id").references(() => galleryImages.id),
  items: json("items").$type<Array<{productId: number, quantity: number, price: number}>>(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending"),
  shipping_address: json("shipping_address"),
  tracking_number: text("tracking_number"),
  fulfilled_at: timestamp("fulfilled_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  role: text("role").notNull(),
  permissions: json("permissions").$type<Array<string>>(),
  hourly_rate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  active: boolean("active").default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
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
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  ai_category: text("ai_category").default("general_inquiry").notNull(),
  suggested_response: text("suggested_response"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const clientMessages = pgTable("client_messages", {
  id: serial("id").primaryKey(),
  client_id: integer("client_id").references(() => clients.id).notNull(),
  message: text("message").notNull(),
  is_from_client: boolean("is_from_client").default(true).notNull(),
  sender_name: text("sender_name").notNull(),
  sender_email: text("sender_email").notNull(),
  status: text("status").default("unread").notNull(), // unread, read, replied
  created_at: timestamp("created_at").defaultNow().notNull(),
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
  social_media: json("social_media").$type<{
    instagram: string;
    facebook: string;
    youtube: string;
  }>().default({ instagram: "", facebook: "", youtube: "" }),
  is_active: boolean("is_active").default(true).notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
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
    fields: [bookings.client_id],
    references: [clients.id],
  }),
  service: one(services, {
    fields: [bookings.service_id],
    references: [services.id],
  }),
  contract: one(contracts),
  invoice: one(invoices),
  galleryImages: many(galleryImages),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  booking: one(bookings, {
    fields: [contracts.booking_id],
    references: [bookings.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  booking: one(bookings, {
    fields: [invoices.booking_id],
    references: [bookings.id],
  }),
}));

export const galleryImagesRelations = relations(galleryImages, ({ one }) => ({
  booking: one(bookings, {
    fields: [galleryImages.booking_id],
    references: [bookings.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  created_at: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  created_at: true,
});

// Contract schema - custom definition to handle date strings properly
export const insertContractSchema = z.object({
  client_id: z.number(),
  contract_type: z.enum(['individual', 'business']),
  service_type: z.string().nullable(),
  title: z.string().min(1),
  template_content: z.string(),
  session_date: z.string().nullable().transform(val => val ? new Date(val) : null),
  location: z.string().nullable(),
  package_type: z.string().nullable(),
  total_amount: z.string().nullable(),
  retainer_amount: z.string().nullable(),
  balance_amount: z.string().nullable(),
  payment_terms: z.string().nullable(),
  deliverables: z.string().nullable(),
  timeline: z.string().nullable(),
  usage_rights: z.string().nullable(),
  cancellation_policy: z.string().nullable(),
  additional_terms: z.string().nullable(),
  booking_id: z.number().nullable(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
});

export const insertGalleryImageSchema = createInsertSchema(galleryImages).omit({
  id: true,
  uploaded_at: true,
});

export const insertAiChatSchema = createInsertSchema(aiChats).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  created_at: true,
});

export const insertCommunicationLogSchema = createInsertSchema(communicationLog).omit({
  id: true,
  created_at: true,
});

export const insertAutomationSequenceSchema = createInsertSchema(automationSequences).omit({
  id: true,
  created_at: true,
});

export const insertQuestionnaireSchema = createInsertSchema(questionnaires).omit({
  id: true,
  created_at: true,
});

export const insertClientPortalSessionSchema = createInsertSchema(clientPortalSessions).omit({
  id: true,
  created_at: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  created_at: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  created_at: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  created_at: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  created_at: true,
});

export const insertClientMessageSchema = createInsertSchema(clientMessages).omit({
  id: true,
  created_at: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  created_at: true,
  updated_at: true,
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