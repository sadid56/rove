import fastify, { type FastifyInstance } from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { env } from "./config/env";
import { registerCors } from "./plugins/cors";
import { registerErrorHandler } from "./plugins/error-handler";
import { registerHelmet } from "./plugins/helmet";
import { registerSwagger } from "./plugins/swagger";

import { authRoutes } from "./modules/auth/auth.routes";

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    disableRequestLogging: true,
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === "development"
          ? {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "HH:MM:ss",
                ignore: "pid,hostname,reqId,req,res",
                singleLine: true,
              },
            }
          : undefined,
    },
  });

  app.addHook("onResponse", (request, reply, done) => {
    const ms = Math.round(reply.elapsedTime);
    const status = reply.statusCode;
    const method = request.method;
    const url = request.url;
    request.log.info(`${method} ${url} ${status} (${ms}ms)`);
    done();
  });

  // Set Zod compilers
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Security & Core Plugins
  await registerCors(app);
  await registerHelmet(app);
  registerErrorHandler(app);

  // Swagger Documentation
  await registerSwagger(app);

  // Root redirect/status
  app.get("/", async (_req, reply) => {
    return reply.send({
      name: "Rove API",
      status: "operational",
      docs: "/docs",
      version: "0.1.0",
    });
  });

  // Register Better Auth plugin
  await app.register(authRoutes, { prefix: "/api/v1" });

  // Mount Organic oRPC Handlers
  const { RPCHandler } = await import("@orpc/server/fastify");
  const { OpenAPIHandler } = await import("@orpc/openapi/fastify");
  const { appRouter } = await import("./router");

  const rpcHandler = new RPCHandler(appRouter);
  const openApiHandler = new OpenAPIHandler(appRouter);

  // oRPC RPC Endpoint for type-safe client calls
  app.all("/rpc", async (req, reply) => {
    const result = await rpcHandler.handle(req, reply, { prefix: "/rpc" });
    if (!result.matched) {
      return reply.status(404).send({ error: "RPC Procedure Not Found" });
    }
  });

  app.all("/rpc/*", async (req, reply) => {
    const result = await rpcHandler.handle(req, reply, { prefix: "/rpc" });
    if (!result.matched) {
      return reply.status(404).send({ error: "RPC Procedure Not Found" });
    }
  });

  // oRPC OpenAPI REST Endpoint for HTTP calls (e.g. /api/v1/scans, /api/v1/projects)
  app.all("/api/v1/*", async (req, reply) => {
    const result = await openApiHandler.handle(req, reply, { prefix: "/api/v1" });
    if (!result.matched) {
      return reply.status(404).send({ error: "API Route Not Found" });
    }
  });

  return app;
}
