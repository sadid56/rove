import type { FastifyInstance } from "fastify";

export function registerRequestLogger(app: FastifyInstance): void {
  app.addHook("onResponse", async (request, reply) => {
    const ms = Math.round(reply.elapsedTime);
    const status = reply.statusCode;
    const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";

    request.log[level](
      {
        reqId: request.id,
        method: request.method,
        url: request.url,
        status,
        durationMs: ms,
      },
      `${request.method} ${request.url} ${status} (${ms}ms)`,
    );
  });
}
