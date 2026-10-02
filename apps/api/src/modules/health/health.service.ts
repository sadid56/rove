import { env } from "../../config/env";
import type { HealthResponse } from "./health.schemas";

export class HealthService {
  getHealth(): HealthResponse {
    return {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: "0.1.0",
      environment: env.NODE_ENV,
    };
  }
}

export const healthService = new HealthService();
