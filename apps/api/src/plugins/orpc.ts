import type { FastifyInstance } from "fastify";
import { RPCHandler } from "@orpc/server/fastify";
import { OpenAPIHandler } from "@orpc/openapi/fastify";
import { appRouter } from "../router";

export async function registerOrpc(app: FastifyInstance): Promise<void> {
  const rpcHandler = new RPCHandler(appRouter);
  const openApiHandler = new OpenAPIHandler(appRouter);

  const matcherTree = (rpcHandler as any).standardHandler?.matcher?.tree;
  if (matcherTree) {
    for (const [key, val] of Object.entries(matcherTree)) {
      const kebabKey = key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
      if (kebabKey !== key) {
        matcherTree[kebabKey] = val;
      }
    }
  }

  // Support direct /rpc
  app.all("/rpc", async (req, reply) => {
    const result = await rpcHandler.handle(req, reply, {
      prefix: "/rpc",
      context: { req, reply },
    });
    if (!result.matched) {
      return reply.status(404).send({ error: "RPC Procedure Not Found" });
    }
  });

  app.all("/rpc/*", async (req, reply) => {
    const result = await rpcHandler.handle(req, reply, {
      prefix: "/rpc",
      context: { req, reply },
    });
    if (!result.matched) {
      return reply.status(404).send({ error: "RPC Procedure Not Found" });
    }
  });

  // Support /api/rpc
  await app.register(
    async (scope) => {
      scope.all("/rpc", async (req, reply) => {
        const result = await rpcHandler.handle(req, reply, {
          prefix: "/api/rpc",
          context: { req, reply },
        });
        if (!result.matched) {
          return reply.status(404).send({ error: "RPC Procedure Not Found" });
        }
      });

      scope.all("/rpc/*", async (req, reply) => {
        const result = await rpcHandler.handle(req, reply, {
          prefix: "/api/rpc",
          context: { req, reply },
        });
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
        const result = await openApiHandler.handle(req, reply, {
          prefix: "/api/openapi",
          context: { req, reply },
        });
        if (!result.matched) {
          return reply.status(404).send({ error: "API Route Not Found" });
        }
      });
    },
    { prefix: "/api/openapi" },
  );

}
