CREATE TABLE "ai_chats" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"client_email" text,
	"messages" json NOT NULL,
	"deal_data" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_sequences" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"trigger" text NOT NULL,
	"active" boolean DEFAULT true,
	"steps" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"service_id" integer,
	"date" timestamp NOT NULL,
	"duration" integer,
	"location" text,
	"total_price" text,
	"deposit_paid" boolean DEFAULT false,
	"status" text DEFAULT 'pending',
	"notes" text,
	"add_ons" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"message" text NOT NULL,
	"is_from_client" boolean DEFAULT true NOT NULL,
	"sender_name" text NOT NULL,
	"sender_email" text NOT NULL,
	"status" text DEFAULT 'unread' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_portal_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"session_token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "client_portal_sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"notes" text,
	"tags" text[],
	"status" text DEFAULT 'lead' NOT NULL,
	"lead_source" text,
	"lead_score" integer DEFAULT 0,
	"client_type" text DEFAULT 'seller' NOT NULL,
	"investment_experience" text DEFAULT 'beginner',
	"preferred_communication" text DEFAULT 'email',
	"timezone" text DEFAULT 'America/New_York',
	"last_contact" timestamp,
	"next_follow_up" timestamp,
	"lifetime_value" numeric(10, 2) DEFAULT '0.00',
	"referral_source" text,
	"motivation_level" integer DEFAULT 5,
	"timeframe" text,
	"address" text,
	"credit_score" integer,
	"annual_income" numeric(12, 2),
	"liquid_cash" numeric(12, 2),
	"custom_fields" json DEFAULT '{}'::json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communication_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"user_id" integer,
	"type" text NOT NULL,
	"direction" text NOT NULL,
	"subject" text,
	"content" text,
	"status" text,
	"metadata" json,
	"scheduled_for" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comparables" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"comp_address" text NOT NULL,
	"distance" numeric(4, 2),
	"sale_price" numeric(12, 2),
	"sale_date" timestamp,
	"bedrooms" integer,
	"bathrooms" numeric(3, 1),
	"square_feet" integer,
	"price_per_sqft" numeric(8, 2),
	"days_on_market" integer,
	"condition" text,
	"source" text,
	"confidence_score" integer,
	"adjustments" json,
	"adjusted_value" numeric(12, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'unread' NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"source" text DEFAULT 'website' NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"ai_category" text DEFAULT 'general_inquiry' NOT NULL,
	"suggested_response" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer,
	"client_id" integer NOT NULL,
	"contract_type" text NOT NULL,
	"service_type" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"title" text NOT NULL,
	"template_content" text NOT NULL,
	"signed_content" text,
	"session_date" timestamp,
	"location" text,
	"package_type" text,
	"total_amount" numeric(10, 2),
	"retainer_amount" numeric(10, 2),
	"balance_amount" numeric(10, 2),
	"payment_terms" text,
	"deliverables" text,
	"timeline" text,
	"usage_rights" text,
	"cancellation_policy" text,
	"additional_terms" text,
	"client_signature" text,
	"client_signed_at" timestamp,
	"client_ip_address" text,
	"photographer_signature" text,
	"photographer_signed_at" timestamp,
	"signature_request_sent" timestamp,
	"portal_access_token" text,
	"is_fully_signed" boolean DEFAULT false,
	"signature_metadata" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deal_analysis" (
	"id" serial PRIMARY KEY NOT NULL,
	"deal_id" integer NOT NULL,
	"property_id" integer NOT NULL,
	"analysis_type" text NOT NULL,
	"purchase_price" numeric(12, 2) NOT NULL,
	"arv" numeric(12, 2),
	"repair_costs" numeric(10, 2),
	"holding_costs" numeric(8, 2),
	"closing_costs" numeric(8, 2),
	"monthly_rent" numeric(8, 2),
	"monthly_expenses" numeric(8, 2),
	"cash_flow" numeric(8, 2),
	"cap_rate" numeric(5, 3),
	"cash_on_cash_return" numeric(5, 3),
	"roi" numeric(5, 3),
	"profit_potential" numeric(10, 2),
	"risk_score" integer DEFAULT 5,
	"recommendation" text,
	"notes" text,
	"calculated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deals" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"property_id" integer NOT NULL,
	"strategy_id" integer NOT NULL,
	"deal_name" text NOT NULL,
	"stage" text DEFAULT 'prospect' NOT NULL,
	"purchase_price" numeric(12, 2),
	"arv" numeric(12, 2),
	"repair_costs" numeric(10, 2),
	"wholesale_fee" numeric(10, 2),
	"projected_profit" numeric(10, 2),
	"actual_profit" numeric(10, 2),
	"contract_date" timestamp,
	"closing_date" timestamp,
	"earnest_money" numeric(10, 2),
	"financing_type" text,
	"monthly_payment" numeric(10, 2),
	"interest_rate" numeric(5, 3),
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"attachments" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gallery_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"original_name" text NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"category" text,
	"tags" text[],
	"featured" boolean DEFAULT false,
	"booking_id" integer,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investment_strategies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"minimum_profit" numeric(10, 2),
	"risk_level" text DEFAULT 'medium',
	"time_to_complete" integer,
	"active" boolean DEFAULT true,
	"requirements" json,
	"resources" text[]
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"due_date" timestamp NOT NULL,
	"paid_at" timestamp,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_method" text
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer,
	"property_id" integer,
	"source" text NOT NULL,
	"medium" text,
	"campaign" text,
	"lead_type" text DEFAULT 'seller' NOT NULL,
	"motivation" text,
	"form_data" json,
	"score" integer DEFAULT 0,
	"temperature" text DEFAULT 'cold',
	"qualification" text,
	"assigned_to" integer,
	"converted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"bio" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"address" text NOT NULL,
	"headshot" text,
	"license_number" text,
	"brokerage" text,
	"specialties" text[],
	"social_media" json DEFAULT '{"facebook":"","instagram":"","youtube":"","linkedin":"","tiktok":""}'::json,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"county" text,
	"property_type" text NOT NULL,
	"bedrooms" integer,
	"bathrooms" numeric(3, 1),
	"square_feet" integer,
	"lot_size" numeric(8, 2),
	"year_built" integer,
	"condition" text,
	"occupancy" text DEFAULT 'vacant',
	"current_rent" numeric(8, 2),
	"market_rent" numeric(8, 2),
	"tax_assessed_value" numeric(12, 2),
	"annual_taxes" numeric(10, 2),
	"insurance" numeric(8, 2),
	"utilities" numeric(6, 2),
	"hoa" numeric(6, 2),
	"parcel_number" text,
	"mls_number" text,
	"list_price" numeric(12, 2),
	"days_on_market" integer,
	"features" text[],
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer,
	"deal_id" integer,
	"filename" text NOT NULL,
	"original_name" text NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"category" text,
	"room_type" text,
	"tags" text[],
	"ai_analysis" json,
	"featured" boolean DEFAULT false,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questionnaires" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text,
	"questions" json,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_providers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"company" text,
	"category" text NOT NULL,
	"specialties" text[],
	"phone" text,
	"email" text,
	"address" text,
	"rating" numeric(3, 2),
	"hourly_rate" numeric(8, 2),
	"project_rate" numeric(10, 2),
	"license_number" text,
	"insurance_verified" boolean DEFAULT false,
	"preferred" boolean DEFAULT false,
	"active" boolean DEFAULT true,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(10, 2),
	"duration" integer,
	"category" text,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"deal_id" integer NOT NULL,
	"client_id" integer,
	"assigned_to" integer,
	"title" text NOT NULL,
	"description" text,
	"category" text,
	"priority" text DEFAULT 'medium',
	"status" text DEFAULT 'pending',
	"due_date" timestamp,
	"completed_at" timestamp,
	"estimated_cost" numeric(10, 2),
	"actual_cost" numeric(10, 2),
	"service_provider_id" integer,
	"attachments" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role" text NOT NULL,
	"permissions" json,
	"hourly_rate" numeric(10, 2),
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'admin' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_messages" ADD CONSTRAINT "client_messages_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_portal_sessions" ADD CONSTRAINT "client_portal_sessions_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_log" ADD CONSTRAINT "communication_log_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_log" ADD CONSTRAINT "communication_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comparables" ADD CONSTRAINT "comparables_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_analysis" ADD CONSTRAINT "deal_analysis_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_analysis" ADD CONSTRAINT "deal_analysis_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_strategy_id_investment_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."investment_strategies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_service_provider_id_service_providers_id_fk" FOREIGN KEY ("service_provider_id") REFERENCES "public"."service_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;