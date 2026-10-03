import { implement, ORPCError } from "@orpc/server";
import { scanContract } from "@repo/contract";
import { scansService } from "./scans.service";

export const listScans = implement(scanContract.list).handler(
  async ({ input }) => {
    return await scansService.list(input);
  }
);

export const getScan = implement(scanContract.get).handler(
  async ({ input }) => {
    const scan = await scansService.findById(input.id);
    if (!scan) {
      throw new ORPCError("NOT_FOUND", {
        message: `Scan with ID ${input.id} was not found`
      });
    }
    return scan;
  }
);

export const listScanRoutes = implement(scanContract.listRoutes).handler(
  async ({ input }) => {
    return await scansService.listRoutes(input);
  }
);

export const getPageDetail = implement(scanContract.getPageDetail).handler(
  async ({ input }) => {
    const page = await scansService.getPageDetail(input.pageId);
    if (!page) {
      throw new ORPCError("NOT_FOUND", {
        message: `Page result with ID ${input.pageId} was not found`
      });
    }
    return page;
  }
);

export const createScan = implement(scanContract.create).handler(
  async ({ input }) => {
    return await scansService.create(input);
  }
);

export const updateScanStatus = implement(scanContract.updateStatus).handler(
  async ({ input }) => {
    const updated = await scansService.updateStatus(input.id, input.status);
    if (!updated) {
      throw new ORPCError("NOT_FOUND", {
        message: `Scan with ID ${input.id} was not found`
      });
    }
    return updated;
  }
);

export const scanRouter = {
  list: listScans,
  get: getScan,
  listRoutes: listScanRoutes,
  getPageDetail,
  create: createScan,
  updateStatus: updateScanStatus
};
