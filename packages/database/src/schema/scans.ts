import { pgTable, text, timestamp, jsonb, uuid, integer, boolean } from "drizzle-orm/pg-core";
import { projects } from "./projects";

export const scans = pgTable("scans", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  targetUrl: text("target_url").notNull(),
  status: text("status", {
    enum: ["queued", "discovering", "scanning", "analyzing", "completed", "failed", "cancelled"]
  }).notNull().default("queued"),
  healthScore: integer("health_score"),
  totalRoutes: integer("total_routes").default(0),
  testedRoutes: integer("tested_routes").default(0),
  healthyRoutes: integer("healthy_routes").default(0),
  warningRoutes: integer("warning_routes").default(0),
  failedRoutes: integer("failed_routes").default(0),
  summary: jsonb("summary").$type<{
    consoleErrors?: number;
    failedRequests?: number;
    brokenAssets?: number;
    runtimeErrors?: number;
    renderingDistribution?: Record<string, number>;
    options?: {
      maxPages?: number;
      captureScreenshots?: boolean;
      fullPageScreenshots?: boolean;
      recordVideos?: boolean;
      maxConcurrency?: number;
    };
  }>(),
  aiSummary: jsonb("ai_summary").$type<ScanAiSummary>(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export interface ScanAiSummary {
  overallHealthAssessment: string;
  criticalIssuesCount: number;
  topRiskAreas: string[];
  recommendedActions: string[];
  generatedAt: string;
}

export interface PageAiAnalysis {
  status: "analyzed" | "clean" | "skipped";
  severity: "critical" | "warning" | "info" | "clean";
  rootCause: string;
  summary: string;
  impact: string;
  suggestedFixes: string[];
  codePatch?: string;
  detectedCategories: string[];
  analyzedAt: string;
}

export const scanRoutes = pgTable("scan_routes", {
  id: uuid("id").primaryKey().defaultRandom(),
  scanId: uuid("scan_id").notNull().references(() => scans.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  path: text("path").notNull(),
  status: text("status", {
    enum: ["pending", "scanning", "completed", "failed"]
  }).notNull().default("pending"),
  discoveredVia: text("discovered_via").default("crawler"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const pageResults = pgTable("page_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  scanId: uuid("scan_id").notNull().references(() => scans.id, { onDelete: "cascade" }),
  routeId: uuid("route_id").references(() => scanRoutes.id, { onDelete: "set null" }),
  url: text("url").notNull(),
  path: text("path").notNull(),
  httpStatus: integer("http_status"),
  healthStatus: text("health_status", {
    enum: ["healthy", "warning", "failed"]
  }).notNull().default("healthy"),
  healthReasons: jsonb("health_reasons").$type<string[]>().default([]),
  renderingType: text("rendering_type", {
    enum: ["static", "isr", "ssr", "client-dynamic", "unknown"]
  }).default("unknown"),
  loadTimeMs: integer("load_time_ms"),
  ttfbMs: integer("ttfb_ms"),
  domContentLoadedMs: integer("dom_content_loaded_ms"),
  screenshotUrl: text("screenshot_url"),
  videoUrl: text("video_url"),
  aiAnalysis: jsonb("ai_analysis").$type<PageAiAnalysis>(),
  consoleSummary: jsonb("console_summary").$type<{
    logs: number;
    warnings: number;
    errors: number;
  }>(),
  networkSummary: jsonb("network_summary").$type<{
    total: number;
    failed: number;
    apiFailed: number;
    assetsFailed: number;
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const consoleEvents = pgTable("console_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  pageResultId: uuid("page_result_id").notNull().references(() => pageResults.id, { onDelete: "cascade" }),
  type: text("type", {
    enum: ["error", "warn", "info", "log"]
  }).notNull(),
  message: text("message").notNull(),
  location: text("location"),
  stack: text("stack"),
  timestamp: timestamp("timestamp").defaultNow()
});

export const runtimeErrors = pgTable("runtime_errors", {
  id: uuid("id").primaryKey().defaultRandom(),
  pageResultId: uuid("page_result_id").notNull().references(() => pageResults.id, { onDelete: "cascade" }),
  errorType: text("error_type", {
    enum: ["uncaught", "unhandled_rejection", "hydration"]
  }).notNull(),
  message: text("message").notNull(),
  source: text("source"),
  line: integer("line"),
  stack: text("stack")
});

export const networkRequests = pgTable("network_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  pageResultId: uuid("page_result_id").notNull().references(() => pageResults.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  method: text("method").notNull(),
  status: integer("status"),
  resourceType: text("resource_type"),
  durationMs: integer("duration_ms"),
  failed: boolean("failed").default(false),
  failureReason: text("failure_reason")
});

export const regressions = pgTable("regressions", {
  id: uuid("id").primaryKey().defaultRandom(),
  currentScanId: uuid("current_scan_id").notNull().references(() => scans.id, { onDelete: "cascade" }),
  previousScanId: uuid("previous_scan_id").references(() => scans.id, { onDelete: "set null" }),
  path: text("path").notNull(),
  changeType: text("change_type", {
    enum: ["new_failure", "resolved", "status_change", "performance_degradation", "rendering_change"]
  }).notNull(),
  details: jsonb("details").$type<{
    previousValue?: string | number | null;
    currentValue?: string | number | null;
    evidence?: string;
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
