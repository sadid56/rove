import type { FastifyPluginAsync } from "fastify";
import { auth } from "../../lib/auth";

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.all("/auth/*", async (request, reply) => {
    const url = `${request.protocol}://${request.hostname}${request.url}`;
    const headers = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
      if (value) headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }

    const req = new Request(url, {
      method: request.method,
      headers,
      body:
        request.body && request.method !== "GET" && request.method !== "HEAD"
          ? JSON.stringify(request.body)
          : undefined
    });

    const response = await auth.handler(req);
    reply.status(response.status);

    response.headers.forEach((v, k) => {
      if (k.toLowerCase() !== "set-cookie") {
        reply.header(k, v);
      }
    });

    const setCookies = response.headers.getSetCookie();
    if (setCookies && setCookies.length > 0) {
      reply.header("set-cookie", setCookies);
    }

    return reply.send(await response.text());
  });
};
