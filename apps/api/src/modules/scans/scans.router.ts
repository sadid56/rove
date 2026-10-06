import { ORPCError } from "@orpc/server";
import { scanContract } from "@repo/contract";
import { scansService } from "./scans.service";
import { createProcedure } from "../../utils/procedure";

export const listScans = createProcedure(scanContract.list, (input) =>
  scansService.list(input)
);

export const getScan = createProcedure(scanContract.get, async ({ id }) => {
  const scan = await scansService.findById(id);
  if (!scan) {
    throw new ORPCError("NOT_FOUND", {
      message: `Scan with ID ${id} was not found`
    });
  }
  return scan;
});

export const listScanRoutes = createProcedure(scanContract.listRoutes, (input) =>
  scansService.listRoutes(input)
);

export const getPageDetail = createProcedure(scanContract.pageDetails, async ({ pageId }) => {
  const page = await scansService.getPageDetail(pageId);
  if (!page) {
    throw new ORPCError("NOT_FOUND", {
      message: `Page result with ID ${pageId} was not found`
    });
  }
  return page;
});

export const analyzePageAi = createProcedure(scanContract.analyzePageAi, async ({ pageId }) => {
  const diagnosed = await scansService.analyzePageWithAi(pageId);
  if (!diagnosed) {
    throw new ORPCError("NOT_FOUND", {
      message: `Page result with ID ${pageId} was not found`
    });
  }
  return diagnosed;
});

export const createScan = createProcedure(scanContract.create, (input) =>
  scansService.create(input)
);

export const updateScanStatus = createProcedure(scanContract.updateStatus, async ({ id, status }) => {
  const updated = await scansService.updateStatus(id, status);
  if (!updated) {
    throw new ORPCError("NOT_FOUND", {
      message: `Scan with ID ${id} was not found`
    });
  }
  return updated;
});

export const scanRouter = {
  list: listScans,
  get: getScan,
  listRoutes: listScanRoutes,
  pageDetails: getPageDetail,
  analyzePageAi,
  create: createScan,
  updateStatus: updateScanStatus,
};
