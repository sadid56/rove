import { os, ORPCError } from "@orpc/server";
import { z } from "zod";
import { scansService } from "./scans.service";

export const listScans = os
  .route({
    method: "GET",
    path: "/scans",
    summary: "List all scans"
  })
  .input(z.object({ projectId: z.string().optional() }).optional())
  .handler(async ({ input }) => {
    return await scansService.list(input?.projectId);
  });

export const getScan = os
  .route({
    method: "GET",
    path: "/scans/{id}",
    summary: "Get scan details, health metrics, and route results"
  })
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    const scan = await scansService.findById(input.id);
    if (!scan) {
      throw new ORPCError("NOT_FOUND", {
        message: `Scan with ID ${input.id} was not found`
      });
    }
    return scan;
  });

export const getPageDetail = os
  .route({
    method: "GET",
    path: "/scans/page/{pageId}",
    summary: "Get detailed inspection of a specific tested page"
  })
  .input(z.object({ pageId: z.string() }))
  .handler(async ({ input }) => {
    const page = await scansService.getPageDetail(input.pageId);
    if (!page) {
      throw new ORPCError("NOT_FOUND", {
        message: `Page result with ID ${input.pageId} was not found`
      });
    }
    return page;
  });

export const createScan = os
  .route({
    method: "POST",
    path: "/scans",
    summary: "Trigger a new real-browser production QA scan"
  })
  .input(
    z.object({
      targetUrl: z.string().url(),
      projectId: z.string().optional(),
      options: z
        .object({
          maxPages: z.number().optional(),
          captureScreenshots: z.boolean().optional(),
          fullPageScreenshots: z.boolean().optional(),
          maxConcurrency: z.number().optional()
        })
        .optional()
    })
  )
  .handler(async ({ input }) => {
    return await scansService.create(input);
  });

export const updateScanStatus = os
  .route({
    method: "PATCH",
    path: "/scans/{id}/status",
    summary: "Update the status of a scan job"
  })
  .input(
    z.object({
      id: z.string(),
      status: z.enum([
        "queued",
        "discovering",
        "scanning",
        "analyzing",
        "completed",
        "failed",
        "cancelled"
      ])
    })
  )
  .handler(async ({ input }) => {
    const updated = await scansService.updateStatus(input.id, input.status);
    if (!updated) {
      throw new ORPCError("NOT_FOUND", {
        message: `Scan with ID ${input.id} was not found`
      });
    }
    return updated;
  });

export const scanRouter = {
  list: listScans,
  get: getScan,
  getPageDetail,
  create: createScan,
  updateStatus: updateScanStatus
};
