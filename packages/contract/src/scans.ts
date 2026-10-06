import { oc } from "@orpc/contract";
import { z } from "zod";

export const scanStatusEnum = z.enum([
  "queued",
  "discovering",
  "scanning",
  "analyzing",
  "completed",
  "failed",
  "cancelled",
]);

export const scanOptionsSchema = z
  .object({
    maxPages: z.number().int().min(1).max(2000).optional().default(200),
    captureScreenshots: z.boolean().optional().default(true),
    fullPageScreenshots: z.boolean().optional().default(true),
    maxConcurrency: z.number().int().min(1).max(10).optional().default(3),
  })
  .optional();

export const createScanSchema = z.object({
  targetUrl: z.string().url("Must be a valid target URL (e.g. https://example.com)"),
  projectId: z.string().optional(),
  options: scanOptionsSchema,
});

export const listScansQuerySchema = z
  .object({
    projectId: z.string().optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  })
  .optional();

export const scanIdParamSchema = z.object({
  id: z.string().min(1, "Scan ID is required"),
});

export const listScanRoutesQuerySchema = z.object({
  id: z.string().min(1, "Scan ID is required"),
  healthStatus: z.enum(["all", "healthy", "warning", "failed"]).optional().default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const pageIdParamSchema = z.object({
  pageId: z.string().min(1, "Page ID is required"),
});

export const updateScanStatusSchema = z.object({
  id: z.string().min(1, "Scan ID is required"),
  status: scanStatusEnum,
});

export type ScanStatus = z.infer<typeof scanStatusEnum>;
export type ScanOptions = z.infer<typeof scanOptionsSchema>;
export type CreateScanInput = z.infer<typeof createScanSchema>;
export type ListScansQuery = z.infer<typeof listScansQuerySchema>;
export type ListScanRoutesQuery = z.infer<typeof listScanRoutesQuerySchema>;
export type UpdateScanStatusInput = z.infer<typeof updateScanStatusSchema>;

export const scanContract = {
  list: oc
    .route({
      method: "GET",
      path: "/scans",
      summary: "List paginated scans",
    })
    .input(listScansQuerySchema),
  get: oc
    .route({
      method: "GET",
      path: "/scans/{id}",
      summary: "Get scan details, health metrics, and route results",
    })
    .input(scanIdParamSchema),
  listRoutes: oc
    .route({
      method: "GET",
      path: "/scans/{id}/routes",
      summary: "List paginated routes of a scan with optional health filter",
    })
    .input(listScanRoutesQuerySchema),
  pageDetails: oc
    .route({
      method: "GET",
      path: "/scans/page/{pageId}",
      summary: "Get detailed inspection of a specific tested page",
    })
    .input(pageIdParamSchema),
  analyzePageAi: oc
    .route({
      method: "POST",
      path: "/scans/page/{pageId}/ai-analyze",
      summary: "Run AI diagnostic analysis and fix generator for a tested page",
    })
    .input(pageIdParamSchema),
  create: oc
    .route({
      method: "POST",
      path: "/scans",
      summary: "Trigger a new real-browser production QA scan",
    })
    .input(createScanSchema),
  updateStatus: oc
    .route({
      method: "PATCH",
      path: "/scans/{id}/status",
      summary: "Update the status of a scan job",
    })
    .input(updateScanStatusSchema),
};


