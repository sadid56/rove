import { pgTable, text, timestamp, jsonb, uuid, integer, boolean } from "drizzle-orm/pg-core";

export const journeys = pgTable("journeys", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  stepsCount: integer("steps_count").notNull().default(0),
  lastRun: text("last_run").default("Never"),
  status: text("status", { enum: ["passed", "failed", "running"] }).notNull().default("passed"),
  selfHealed: boolean("self_healed").default(false),
  duration: text("duration").default("0s"),
  steps: jsonb("steps").$type<Array<{
    step: number;
    action: string;
    target: string;
    status: "passed" | "failed";
  }>>().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const apiMonitors = pgTable("api_monitors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  method: text("method", { enum: ["GET", "POST", "PUT", "DELETE"] }).notNull().default("GET"),
  url: text("url").notNull(),
  status: integer("status").notNull().default(200),
  latencyMs: integer("latency_ms").notNull().default(0),
  uptimePercent: integer("uptime_percent").notNull().default(100),
  lastChecked: text("last_checked").default("Just now"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const qaIssues = pgTable("qa_issues", {
  id: uuid("id").primaryKey().defaultRandom(),
  issueKey: text("issue_key").notNull(),
  title: text("title").notNull(),
  route: text("route").notNull(),
  type: text("type").notNull().default("Console Error"),
  severity: text("severity", { enum: ["critical", "high", "medium", "low"] }).notNull().default("high"),
  assignee: text("assignee").default("Unassigned"),
  status: text("status", { enum: ["open", "in_progress", "resolved"] }).notNull().default("open"),
  reportedAt: text("reported_at").default("Just now"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role", { enum: ["Owner", "Admin", "QA Lead", "Developer", "Viewer"] }).notNull().default("Developer"),
  lastActive: text("last_active").default("Invited"),
  avatarInitials: text("avatar_initials").notNull().default("U"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const billingSubscriptions = pgTable("billing_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  planId: text("plan_id").notNull().default("pro"),
  billingCycle: text("billing_cycle", { enum: ["monthly", "annual"] }).notNull().default("monthly"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCheckoutSessionId: text("stripe_checkout_session_id"),
  scansUsed: integer("scans_used").notNull().default(184),
  scansLimit: integer("scans_limit").notNull().default(1000),
  concurrencyLimit: integer("concurrency_limit").notNull().default(5),
  aiTokensUsed: integer("ai_tokens_used").notNull().default(42500),
  aiTokensLimit: integer("ai_tokens_limit").notNull().default(200000),
  paymentMethod: text("payment_method").default("Visa ending in 4242"),
  renewsAt: text("renews_at").default("November 1, 2026"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
