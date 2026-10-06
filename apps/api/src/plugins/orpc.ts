import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { RPCHandler } from "@orpc/server/fastify";
import { appRouter } from "../router";

export async function registerOrpc(app: FastifyInstance): Promise<void> {
  const rpcHandler = new RPCHandler(appRouter);

  const matcherTree = (rpcHandler as any).standardHandler?.matcher?.tree;
  if (matcherTree) {
    for (const [key, val] of Object.entries(matcherTree)) {
      const kebabKey = key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
      if (kebabKey !== key) {
        matcherTree[kebabKey] = val;
      }
    }
  }

  const handleV1Rpc = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = await rpcHandler.handle(req, reply, {
      prefix: "/v1/orpc",
      context: { req, reply },
    });
    if (!result.matched) {
      return reply.status(404).send({ error: "RPC Procedure Not Found" });
    }
  };

  app.all("/v1/orpc", handleV1Rpc);
  app.all("/v1/orpc/*", handleV1Rpc);
}
