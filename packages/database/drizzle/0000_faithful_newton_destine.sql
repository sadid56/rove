CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"slug" text NOT NULL,
	"user_id" text,
	"crawler_config" jsonb DEFAULT '{"maxPages":100,"respectRobots":true,"sameOrigin":true,"excludedPaths":[]}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "console_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_result_id" uuid NOT NULL,
	"type" text NOT NULL,
	"message" text NOT NULL,
	"location" text,
	"stack" text,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "network_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_result_id" uuid NOT NULL,
	"url" text NOT NULL,
	"method" text NOT NULL,
	"status" integer,
	"resource_type" text,
	"duration_ms" integer,
	"failed" boolean DEFAULT false,
	"failure_reason" text
);
--> statement-breakpoint
CREATE TABLE "page_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scan_id" uuid NOT NULL,
	"route_id" uuid,
	"url" text NOT NULL,
	"path" text NOT NULL,
	"http_status" integer,
	"health_status" text DEFAULT 'healthy' NOT NULL,
	"health_reasons" jsonb DEFAULT '[]'::jsonb,
	"rendering_type" text DEFAULT 'unknown',
	"load_time_ms" integer,
	"ttfb_ms" integer,
	"dom_content_loaded_ms" integer,
	"screenshot_url" text,
	"video_url" text,
	"ai_analysis" jsonb,
	"console_summary" jsonb,
	"network_summary" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regressions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"current_scan_id" uuid NOT NULL,
	"previous_scan_id" uuid,
	"path" text NOT NULL,
	"change_type" text NOT NULL,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "runtime_errors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_result_id" uuid NOT NULL,
	"error_type" text NOT NULL,
	"message" text NOT NULL,
	"source" text,
	"line" integer,
	"stack" text
);
--> statement-breakpoint
CREATE TABLE "scan_routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scan_id" uuid NOT NULL,
	"url" text NOT NULL,
	"path" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"discovered_via" text DEFAULT 'crawler',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid,
	"target_url" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"health_score" integer,
	"total_routes" integer DEFAULT 0,
	"tested_routes" integer DEFAULT 0,
	"healthy_routes" integer DEFAULT 0,
	"warning_routes" integer DEFAULT 0,
	"failed_routes" integer DEFAULT 0,
	"summary" jsonb,
	"ai_summary" jsonb,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_monitors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"method" text DEFAULT 'GET' NOT NULL,
	"url" text NOT NULL,
	"status" integer DEFAULT 200 NOT NULL,
	"latency_ms" integer DEFAULT 0 NOT NULL,
	"uptime_percent" integer DEFAULT 100 NOT NULL,
	"last_checked" text DEFAULT 'Just now',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" text DEFAULT 'pro' NOT NULL,
	"billing_cycle" text DEFAULT 'monthly' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"stripe_checkout_session_id" text,
	"scans_used" integer DEFAULT 184 NOT NULL,
	"scans_limit" integer DEFAULT 1000 NOT NULL,
	"concurrency_limit" integer DEFAULT 5 NOT NULL,
	"ai_tokens_used" integer DEFAULT 42500 NOT NULL,
	"ai_tokens_limit" integer DEFAULT 200000 NOT NULL,
	"payment_method" text DEFAULT 'Visa ending in 4242',
	"renews_at" text DEFAULT 'November 1, 2026',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journeys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"steps_count" integer DEFAULT 0 NOT NULL,
	"last_run" text DEFAULT 'Never',
	"status" text DEFAULT 'passed' NOT NULL,
	"self_healed" boolean DEFAULT false,
	"duration" text DEFAULT '0s',
	"steps" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "qa_issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_key" text NOT NULL,
	"title" text NOT NULL,
	"route" text NOT NULL,
	"type" text DEFAULT 'Console Error' NOT NULL,
	"severity" text DEFAULT 'high' NOT NULL,
	"assignee" text DEFAULT 'Unassigned',
	"status" text DEFAULT 'open' NOT NULL,
	"reported_at" text DEFAULT 'Just now',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'Developer' NOT NULL,
	"last_active" text DEFAULT 'Invited',
	"avatar_initials" text DEFAULT 'U' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "console_events" ADD CONSTRAINT "console_events_page_result_id_page_results_id_fk" FOREIGN KEY ("page_result_id") REFERENCES "public"."page_results"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_requests" ADD CONSTRAINT "network_requests_page_result_id_page_results_id_fk" FOREIGN KEY ("page_result_id") REFERENCES "public"."page_results"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_results" ADD CONSTRAINT "page_results_scan_id_scans_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."scans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_results" ADD CONSTRAINT "page_results_route_id_scan_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."scan_routes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regressions" ADD CONSTRAINT "regressions_current_scan_id_scans_id_fk" FOREIGN KEY ("current_scan_id") REFERENCES "public"."scans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regressions" ADD CONSTRAINT "regressions_previous_scan_id_scans_id_fk" FOREIGN KEY ("previous_scan_id") REFERENCES "public"."scans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "runtime_errors" ADD CONSTRAINT "runtime_errors_page_result_id_page_results_id_fk" FOREIGN KEY ("page_result_id") REFERENCES "public"."page_results"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scan_routes" ADD CONSTRAINT "scan_routes_scan_id_scans_id_fk" FOREIGN KEY ("scan_id") REFERENCES "public"."scans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scans" ADD CONSTRAINT "scans_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;