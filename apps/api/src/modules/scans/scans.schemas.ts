import { z } from "zod";

export const scanStatusSchema = z.enum([
  "QUEUED",
  "DISCOVERING",
  "SCANNING",
  "ANALYZING",
  "COMPARING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
]);

export const scanSummarySchema = z.object({
  routesDiscovered: z.number().default(0),
  pagesTested: z.number().default(0),
  healthy: z.number().default(0),
  warnings: z.number().default(0),
  failed: z.number().default(0),
  consoleErrors: z.number().default(0),
  failedRequests: z.number().default(0),
  brokenAssets: z.number().default(0),
});

export const scanSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  targetUrl: z.string().url("Must be a valid URL to scan"),
  status: scanStatusSchema,
  summary: scanSummarySchema,
  options: z
    .object({
      maxPages: z.number().int().min(1).max(2000).default(200),
      captureScreenshots: z.boolean().default(true),
      fullPageScreenshots: z.boolean().default(true),
      maxConcurrency: z.number().int().min(1).max(10).default(3),
    })
    .default({}),
  createdAt: z.string(),
  completedAt: z.string().optional(),
});

export const createScanSchema = z.object({
  targetUrl: z.string().url("Must be a valid target URL (e.g. https://example.com)"),
  projectId: z.string().uuid().optional(),
  options: z
    .object({
      maxPages: z.number().int().min(1).max(2000).optional(),
      captureScreenshots: z.boolean().optional(),
      fullPageScreenshots: z.boolean().optional(),
      maxConcurrency: z.number().int().min(1).max(10).optional(),
    })
    .optional(),
});

export const getScanParamsSchema = z.object({
  id: z.string().uuid(),
});

export type Scan = z.infer<typeof scanSchema>;
export type CreateScanInput = z.infer<typeof createScanSchema>;
export type ScanStatus = z.infer<typeof scanStatusSchema>;
