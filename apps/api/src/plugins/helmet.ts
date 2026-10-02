import type { FastifyInstance } from "fastify";
import fastifyHelmet from "@fastify/helmet";
import { env } from "../config/env";

export async function registerHelmet(app: FastifyInstance) {
  await app.register(fastifyHelmet, {
    // In development, relax CSP to allow Swagger UI scripts/styles without issue
    contentSecurityPolicy:
      env.NODE_ENV === "development"
        ? false
        : {
            directives: {
              defaultSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              scriptSrc: ["'self'"],
              imgSrc: ["'self'", "data:", "validator.swagger.io"],
            },
          },
  });
}
