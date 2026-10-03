import type { FastifyInstance } from "fastify";
import { RPCHandler } from "@orpc/server/fastify";
import { OpenAPIHandler } from "@orpc/openapi/fastify";
import { appRouter } from "../router";

export async function registerOrpc(app: FastifyInstance): Promise<void> {
  const rpcHandler = new RPCHandler(appRouter);
  const openApiHandler = new OpenAPIHandler(appRouter);

  // Support direct /rpc
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

  // Support /api/rpc
  await app.register(
    async (scope) => {
      scope.all("/rpc", async (req, reply) => {
        const result = await rpcHandler.handle(req, reply, { prefix: "/api/rpc" });
        if (!result.matched) {
          return reply.status(404).send({ error: "RPC Procedure Not Found" });
        }
      });

      scope.all("/rpc/*", async (req, reply) => {
        const result = await rpcHandler.handle(req, reply, { prefix: "/api/rpc" });
        if (!result.matched) {
          return reply.status(404).send({ error: "RPC Procedure Not Found" });
        }
      });
    },
    { prefix: "/api" },
  );

  await app.register(
    async (scope) => {
      scope.all("/*", async (req, reply) => {
        const result = await openApiHandler.handle(req, reply, { prefix: "/api/openapi" });
        if (!result.matched) {
          return reply.status(404).send({ error: "API Route Not Found" });
        }
      });
    },
    { prefix: "/api/openapi" },
  );
}
