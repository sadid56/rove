import { os } from "@orpc/server";
import { healthService } from "./health.service";

export const healthCheck = os
  .route({
    method: "GET",
    path: "/health",
    summary: "Check system health and status"
  })
  .handler(async () => {
    return healthService.getHealth();
  });

export const healthRouter = {
  check: healthCheck
};
