import type { FastifyPluginAsync } from "fastify";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../../lib/auth";

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.all("/*", async (req, reply) => {
    return toNodeHandler(auth)(req.raw, reply.raw);
  });
};
