import fastify, { type FastifyInstance } from "fastify";
import { env } from "./config/env";
import { registerCors } from "./plugins/cors";
import { registerErrorHandler } from "./plugins/error-handler";
import { registerHelmet } from "./plugins/helmet";
import { registerHealth } from "./plugins/health";
import { registerOrpc } from "./plugins/orpc";
import { registerRateLimit } from "./plugins/rate-limit";
import { authRoutes } from "./modules/auth/auth.routes";
import { buildPinoLoggerOptions } from "./config/pino";
import { registerRequestLogger } from "./plugins/request-logger";

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    disableRequestLogging: true,
    trustProxy: env.TRUST_PROXY,
    bodyLimit: env.BODY_LIMIT_BYTES,
    requestIdHeader: "x-request-id",
    requestIdLogLabel: "reqId",
    logger: buildPinoLoggerOptions(),
    connectionTimeout: 30_000,
    keepAliveTimeout: 72_000,
  });

  registerRequestLogger(app);

  await registerCors(app);
  await registerHelmet(app);
  await registerRateLimit(app);
  registerErrorHandler(app);

  await registerHealth(app);

  app.get("/", async () => ({
    name: "Rove API",
    status: "operational",
    version: "0.1.0",
  }));

  await app.register(authRoutes, { prefix: "/api/v1/auth" });
  await registerOrpc(app);

  return app;
}