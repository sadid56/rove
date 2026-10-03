import type { FastifyInstance } from "fastify";
import { env } from "../config/env";

export async function registerHealth(app: FastifyInstance): Promise<void> {
  app.get("/health", { logLevel: "warn" }, async () => ({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: "0.1.0",
    environment: env.NODE_ENV,
  }));

  app.get("/ready", { logLevel: "warn" }, async () => ({
    status: "ready",
  }));
}
