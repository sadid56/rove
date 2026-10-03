import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance } from "fastify";
import { env } from "../config/env";

export async function registerRateLimit(app: FastifyInstance): Promise<void> {
  await app.register(rateLimit, {
    global: true,
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
    allowList: (req) => req.url === "/health" || req.url === "/ready",
    keyGenerator: (req) => req.ip,
    errorResponseBuilder: (_req, context) => ({
      error: "Too Many Requests",
      message: `Rate limit exceeded. Retry in ${Math.ceil(context.ttl / 1000)}s.`,
      statusCode: 429,
    }),
  });
}
