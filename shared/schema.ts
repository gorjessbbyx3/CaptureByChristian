import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  decimal,
  json,
} from "drizzle-orm/pg-core";
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
  status: text("status").default("lead").notNull(), // lead, qualified, active, closed, archived
  leadSource: text("lead_source"), // facebook, website, referral, driving4dollars, direct_mail, bandit_signs
  leadScore: integer("lead_score").default(0),
  clientType: text("client_type").notNull().default("seller"), // seller, buyer, investor, wholesaler, bird_dog
  investmentExperience: text("investment_experience").default("beginner"), // beginner, intermediate, advanced
  preferredCommunication: text("preferred_communication").default("email"), // email, text, phone
  timezone: text("timezone").default("America/New_York"),
  lastContact: timestamp("last_contact"),
  nextFollowUp: timestamp("next_follow_up"),
  lifetimeValue: decimal("lifetime_value", { precision: 10, scale: 2 }).default(
    "0.00",
  ),
  referralSource: text("referral_source"),
  motivationLevel: integer("motivation_level").default(5), // 1-10 scale
  timeframe: text("timeframe"), // asap, 30_days, 90_days, flexible
  address: text("address"),
  creditScore: integer("credit_score"),
  annualIncome: decimal("annual_income", { precision: 12, scale: 2 }),
  liquidCash: decimal("liquid_cash", { precision: 12, scale: 2 }),
  customFields: json("custom_fields").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const investmentStrategies = pgTable("investment_strategies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // subject_to, seller_finance, wholesale, fix_flip, brrrr, lease_option
  minimumProfit: decimal("minimum_profit", { precision: 10, scale: 2 }),
  riskLevel: text("risk_level").default("medium"), // low, medium, high
  timeToComplete: integer("time_to_complete"), // days
  active: boolean("active").default(true),
  requirements:
    json("requirements").$type<
      Array<{ requirement: string; critical: boolean }>
    >(),
  resources: text("resources").array(),
});

export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id")
    .references(() => clients.id)
    .notNull(),
  propertyId: integer("property_id")
    .references(() => properties.id)
    .notNull(),
  strategyId: integer("strategy_id")
    .references(() => investmentStrategies.id)
    .notNull(),
  dealName: text("deal_name").notNull(),
  stage: text("stage").notNull().default("prospect"), // prospect, under_contract, due_diligence, closing, closed, dead
  purchasePrice: decimal("purchase_price", { precision: 12, scale: 2 }),
  arv: decimal("arv", { precision: 12, scale: 2 }), // After Repair Value
  repairCosts: decimal("repair_costs", { precision: 10, scale: 2 }),
  wholesaleFee: decimal("wholesale_fee", { precision: 10, scale: 2 }),
  projectedProfit: decimal("projected_profit", { precision: 10, scale: 2 }),
  actualProfit: decimal("actual_profit", { precision: 10, scale: 2 }),
  contractDate: timestamp("contract_date"),
  closingDate: timestamp("closing_date"),
  earnestMoney: decimal("earnest_money", { precision: 10, scale: 2 }),
  financingType: text("financing_type"), // cash, conventional, subject_to, seller_finance, hard_money
  monthlyPayment: decimal("monthly_payment", { precision: 10, scale: 2 }),
  interestRate: decimal("interest_rate", { precision: 5, scale: 3 }),
  status: text("status").notNull().default("active"), // active, completed, cancelled, on_hold
  notes: text("notes"),
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  booking_id: integer("booking_id").references(() => bookings.id),
  client_id: integer("client_id")
    .references(() => clients.id)
    .notNull(),
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
    signatureMethod?: "electronic" | "digital";
    witnessRequired?: boolean;
    notarizedRequired?: boolean;
  }>(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Legacy tables for backward compatibility
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }),
  duration: integer("duration"), // in minutes
  category: text("category"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id")
    .references(() => clients.id)
    .notNull(),
  serviceId: integer("service_id").references(() => services.id),
  date: timestamp("date").notNull(),
  duration: integer("duration"),
  location: text("location"),
  totalPrice: text("total_price"),
  depositPaid: boolean("deposit_paid").default(false),
  status: text("status").default("pending"),
  notes: text("notes"),
  addOns: json("add_ons"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const galleryImages = pgTable("gallery_images", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  original_name: text("original_name").notNull(),
  url: text("url").notNull(),
  thumbnail_url: text("thumbnail_url"),
  category: text("category"),
  tags: text("tags").array(),
  featured: boolean("featured").default(false),
  booking_id: integer("booking_id").references(() => bookings.id),
  uploaded_at: timestamp("uploaded_at").defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  booking_id: integer("booking_id")
    .references(() => bookings.id)
    .notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  due_date: timestamp("due_date").notNull(),
  paid_at: timestamp("paid_at"),
  status: text("status").notNull().default("pending"), // pending, paid, overdue
  payment_method: text("payment_method"),
});

export const propertyImages = pgTable("property_images", {
  id: serial("id").primaryKey(),
  property_id: integer("property_id").references(() => properties.id),
  deal_id: integer("deal_id").references(() => deals.id),
  filename: text("filename").notNull(),
  original_name: text("original_name").notNull(),
  url: text("url").notNull(),
  thumbnail_url: text("thumbnail_url"),
  category: text("category"), // exterior, interior, before, after, aerial, street_view
  room_type: text("room_type"), // kitchen, bathroom, bedroom, living_room, basement, garage
  tags: text("tags").array(),
  ai_analysis: json("ai_analysis").$type<{
    condition?: string;
    repairNeeds?: string[];
    estimatedRepairCost?: number;
    roomSize?: string;
    features?: string[];
  }>(),
  featured: boolean("featured").default(false),
  uploaded_at: timestamp("uploaded_at").defaultNow().notNull(),
});

export const aiChats = pgTable("ai_chats", {
  id: serial("id").primaryKey(),
  session_id: text("session_id").notNull(),
  client_email: text("client_email"),
  messages: json("messages")
    .$type<
      Array<{
        role: "user" | "assistant";
        content: string;
        timestamp: number;
      }>
    >()
    .notNull(),
  deal_data: json("deal_data").$type<{
    propertyAddress?: string;
    strategy?: string;
    budget?: number;
    timeline?: string;
    goals?: string[];
  }>(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Real Estate Specific Tables
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  county: text("county"),
  propertyType: text("property_type").notNull(), // sfh, duplex, triplex, fourplex, apartment, commercial
  bedrooms: integer("bedrooms"),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }),
  squareFeet: integer("square_feet"),
  lotSize: decimal("lot_size", { precision: 8, scale: 2 }),
  yearBuilt: integer("year_built"),
  condition: text("condition"), // excellent, good, fair, poor
  occupancy: text("occupancy").default("vacant"), // vacant, owner_occupied, tenant_occupied
  currentRent: decimal("current_rent", { precision: 8, scale: 2 }),
  marketRent: decimal("market_rent", { precision: 8, scale: 2 }),
  taxAssessedValue: decimal("tax_assessed_value", { precision: 12, scale: 2 }),
  annualTaxes: decimal("annual_taxes", { precision: 10, scale: 2 }),
  insurance: decimal("insurance", { precision: 8, scale: 2 }),
  utilities: decimal("utilities", { precision: 6, scale: 2 }),
  hoa: decimal("hoa", { precision: 6, scale: 2 }),
  parcelNumber: text("parcel_number"),
  mlsNumber: text("mls_number"),
  listPrice: decimal("list_price", { precision: 12, scale: 2 }),
  daysOnMarket: integer("days_on_market"),
  features: text("features").array(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  propertyId: integer("property_id").references(() => properties.id),
  source: text("source").notNull(), // driving4dollars, direct_mail, bandit_signs, referral, online
  medium: text("medium"),
  campaign: text("campaign"),
  leadType: text("lead_type").notNull().default("seller"), // seller, buyer, investor, bird_dog
  motivation: text("motivation"), // foreclosure, divorce, inheritance, relocation, financial_distress
  formData: json("form_data"),
  score: integer("score").default(0),
  temperature: text("temperature").default("cold"), // hot, warm, cold
  qualification: text("qualification"),
  assignedTo: integer("assigned_to").references(() => users.id),
  convertedAt: timestamp("converted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communicationLog = pgTable("communication_log", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id")
    .references(() => clients.id)
    .notNull(),
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
  steps:
    json("steps").$type<
      Array<{ delay: number; type: string; template: string }>
    >(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dealAnalysis = pgTable("deal_analysis", {
  id: serial("id").primaryKey(),
  deal_id: integer("deal_id")
    .references(() => deals.id)
    .notNull(),
  property_id: integer("property_id")
    .references(() => properties.id)
    .notNull(),
  analysis_type: text("analysis_type").notNull(), // flip, rental, wholesale, subject_to
  purchase_price: decimal("purchase_price", {
    precision: 12,
    scale: 2,
  }).notNull(),
  arv: decimal("arv", { precision: 12, scale: 2 }),
  repair_costs: decimal("repair_costs", { precision: 10, scale: 2 }),
  holding_costs: decimal("holding_costs", { precision: 8, scale: 2 }),
  closing_costs: decimal("closing_costs", { precision: 8, scale: 2 }),
  monthly_rent: decimal("monthly_rent", { precision: 8, scale: 2 }),
  monthly_expenses: decimal("monthly_expenses", { precision: 8, scale: 2 }),
  cash_flow: decimal("cash_flow", { precision: 8, scale: 2 }),
  cap_rate: decimal("cap_rate", { precision: 5, scale: 3 }),
  cash_on_cash_return: decimal("cash_on_cash_return", {
    precision: 5,
    scale: 3,
  }),
  roi: decimal("roi", { precision: 5, scale: 3 }),
  profit_potential: decimal("profit_potential", { precision: 10, scale: 2 }),
  risk_score: integer("risk_score").default(5), // 1-10 scale
  recommendation: text("recommendation"), // buy, pass, negotiate
  notes: text("notes"),
  calculated_at: timestamp("calculated_at").defaultNow().notNull(),
});

export const questionnaires = pgTable("questionnaires", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"), // seller_intake, buyer_intake, investor_profile
  questions:
    json("questions").$type<
      Array<{
        id: string;
        type: string;
        question: string;
        required: boolean;
        options?: string[];
      }>
    >(),
  active: boolean("active").default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const clientPortalSessions = pgTable("client_portal_sessions", {
  id: serial("id").primaryKey(),
  client_id: integer("client_id")
    .references(() => clients.id)
    .notNull(),
  session_token: text("session_token").notNull().unique(),
  expires_at: timestamp("expires_at").notNull(),
  ip_address: text("ip_address"),
  user_agent: text("user_agent"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const serviceProviders = pgTable("service_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company"),
  category: text("category").notNull(), // contractor, inspector, appraiser, attorney, title_company, lender
  specialties: text("specialties").array(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  hourly_rate: decimal("hourly_rate", { precision: 8, scale: 2 }),
  project_rate: decimal("project_rate", { precision: 10, scale: 2 }),
  license_number: text("license_number"),
  insurance_verified: boolean("insurance_verified").default(false),
  preferred: boolean("preferred").default(false),
  active: boolean("active").default(true),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  deal_id: integer("deal_id")
    .references(() => deals.id)
    .notNull(),
  client_id: integer("client_id").references(() => clients.id),
  assigned_to: integer("assigned_to").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"), // inspection, appraisal, financing, paperwork, marketing
  priority: text("priority").default("medium"), // low, medium, high, urgent
  status: text("status").default("pending"), // pending, in_progress, completed, cancelled
  due_date: timestamp("due_date"),
  completed_at: timestamp("completed_at"),
  estimated_cost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  actual_cost: decimal("actual_cost", { precision: 10, scale: 2 }),
  service_provider_id: integer("service_provider_id").references(
    () => serviceProviders.id,
  ),
  attachments: text("attachments").array(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .references(() => users.id)
    .notNull(),
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
  client_id: integer("client_id")
    .references(() => clients.id)
    .notNull(),
  message: text("message").notNull(),
  is_from_client: boolean("is_from_client").default(true).notNull(),
  sender_name: text("sender_name").notNull(),
  sender_email: text("sender_email").notNull(),
  status: text("status").default("unread").notNull(), // unread, read, replied
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const comparables = pgTable("comparables", {
  id: serial("id").primaryKey(),
  property_id: integer("property_id")
    .references(() => properties.id)
    .notNull(),
  comp_address: text("comp_address").notNull(),
  distance: decimal("distance", { precision: 4, scale: 2 }), // miles
  sale_price: decimal("sale_price", { precision: 12, scale: 2 }),
  sale_date: timestamp("sale_date"),
  bedrooms: integer("bedrooms"),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }),
  square_feet: integer("square_feet"),
  price_per_sqft: decimal("price_per_sqft", { precision: 8, scale: 2 }),
  days_on_market: integer("days_on_market"),
  condition: text("condition"),
  source: text("source"), // mls, public_records, automated_valuation
  confidence_score: integer("confidence_score"), // 1-100
  adjustments:
    json("adjustments").$type<
      Array<{ factor: string; amount: number; reason: string }>
    >(),
  adjusted_value: decimal("adjusted_value", { precision: 12, scale: 2 }),
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
  license_number: text("license_number"),
  brokerage: text("brokerage"),
  specialties: text("specialties").array(),
  social_media: json("social_media")
    .$type<{
      facebook: string;
      instagram: string;
      youtube: string;
      linkedin: string;
      tiktok: string;
    }>()
    .default({
      facebook: "",
      instagram: "",
      youtube: "",
      linkedin: "",
      tiktok: "",
    }),
  is_active: boolean("is_active").default(true).notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const clientsRelations = relations(clients, ({ many }) => ({
  deals: many(deals),
  leads: many(leads),
}));

export const propertiesRelations = relations(properties, ({ many }) => ({
  deals: many(deals),
  propertyImages: many(propertyImages),
  comparables: many(comparables),
  dealAnalysis: many(dealAnalysis),
}));

export const investmentStrategiesRelations = relations(
  investmentStrategies,
  ({ many }) => ({
    deals: many(deals),
  }),
);

export const dealsRelations = relations(deals, ({ one, many }) => ({
  client: one(clients, {
    fields: [deals.clientId],
    references: [clients.id],
  }),
  property: one(properties, {
    fields: [deals.propertyId],
    references: [properties.id],
  }),
  strategy: one(investmentStrategies, {
    fields: [deals.strategyId],
    references: [investmentStrategies.id],
  }),
  propertyImages: many(propertyImages),
  tasks: many(tasks),
  dealAnalysis: many(dealAnalysis),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  client: one(clients, {
    fields: [contracts.client_id],
    references: [clients.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  booking: one(deals, {
    fields: [invoices.booking_id],
    references: [deals.id],
  }),
}));

export const propertyImagesRelations = relations(propertyImages, ({ one }) => ({
  property: one(properties, {
    fields: [propertyImages.property_id],
    references: [properties.id],
  }),
  deal: one(deals, {
    fields: [propertyImages.deal_id],
    references: [deals.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  deal: one(deals, {
    fields: [tasks.deal_id],
    references: [deals.id],
  }),
  client: one(clients, {
    fields: [tasks.client_id],
    references: [clients.id],
  }),
  serviceProvider: one(serviceProviders, {
    fields: [tasks.service_provider_id],
    references: [serviceProviders.id],
  }),
}));

export const comparablesRelations = relations(comparables, ({ one }) => ({
  property: one(properties, {
    fields: [comparables.property_id],
    references: [properties.id],
  }),
}));

export const dealAnalysisRelations = relations(dealAnalysis, ({ one }) => ({
  deal: one(deals, {
    fields: [dealAnalysis.deal_id],
    references: [deals.id],
  }),
  property: one(properties, {
    fields: [dealAnalysis.property_id],
    references: [properties.id],
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

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvestmentStrategySchema = createInsertSchema(
  investmentStrategies,
).omit({
  id: true,
});

export const insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Legacy schema exports for backward compatibility
export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export const insertGalleryImageSchema = createInsertSchema(galleryImages).omit({
  id: true,
  uploaded_at: true,
});

// Contract schema - custom definition to handle date strings properly
export const insertContractSchema = z.object({
  client_id: z.number(),
  contract_type: z.enum(["individual", "business"]),
  service_type: z.string().nullable(),
  title: z.string().min(1),
  template_content: z.string(),
  session_date: z
    .string()
    .nullable()
    .transform((val) => (val ? new Date(val) : null)),
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

export const insertPropertyImageSchema = createInsertSchema(
  propertyImages,
).omit({
  id: true,
  uploaded_at: true,
});

export const insertDealAnalysisSchema = createInsertSchema(dealAnalysis).omit({
  id: true,
  calculated_at: true,
});

export const insertComparableSchema = createInsertSchema(comparables).omit({
  id: true,
  created_at: true,
});

export const insertServiceProviderSchema = createInsertSchema(
  serviceProviders,
).omit({
  id: true,
  created_at: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertAiChatSchema = createInsertSchema(aiChats).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export const insertCommunicationLogSchema = createInsertSchema(
  communicationLog,
).omit({
  id: true,
  createdAt: true,
});

export const insertAutomationSequenceSchema = createInsertSchema(
  automationSequences,
).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionnaireSchema = createInsertSchema(
  questionnaires,
).omit({
  id: true,
  created_at: true,
});

export const insertClientPortalSessionSchema = createInsertSchema(
  clientPortalSessions,
).omit({
  id: true,
  created_at: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  created_at: true,
});

export const insertContactMessageSchema = createInsertSchema(
  contactMessages,
).omit({
  id: true,
  created_at: true,
});

export const insertClientMessageSchema = createInsertSchema(
  clientMessages,
).omit({
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

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

export type InvestmentStrategy = typeof investmentStrategies.$inferSelect;
export type InsertInvestmentStrategy = typeof investmentStrategies.$inferInsert;

export type Deal = typeof deals.$inferSelect;
export type InsertDeal = typeof deals.$inferInsert;

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;

// Legacy table types for backward compatibility
export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = typeof galleryImages.$inferInsert;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

export type PropertyImage = typeof propertyImages.$inferSelect;
export type InsertPropertyImage = typeof propertyImages.$inferInsert;

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
export type InsertClientPortalSession =
  typeof clientPortalSessions.$inferInsert;

export type ServiceProvider = typeof serviceProviders.$inferSelect;
export type InsertServiceProvider = typeof serviceProviders.$inferInsert;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

export type ClientMessage = typeof clientMessages.$inferSelect;
export type InsertClientMessage = typeof clientMessages.$inferInsert;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

export type DealAnalysis = typeof dealAnalysis.$inferSelect;
export type InsertDealAnalysis = typeof dealAnalysis.$inferInsert;

export type Comparable = typeof comparables.$inferSelect;
export type InsertComparable = typeof comparables.$inferInsert;
