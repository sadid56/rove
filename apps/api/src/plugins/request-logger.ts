import type { FastifyInstance } from "fastify";
import { logger } from "@repo/config";


export function registerRequestLogger(app: FastifyInstance): void {
  app.addHook("onResponse", async (request, reply) => {
    const ms = Math.round(reply.elapsedTime);
    logger.http(request.method, request.url, reply.statusCode, ms);
  });
}



