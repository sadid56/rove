import type { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { jsonSchemaTransform } from "fastify-type-provider-zod";

export async function registerSwagger(app: FastifyInstance) {
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Rove API",
        description:
          "Automated Production QA & Web Application Intelligence Platform API",
        version: "0.1.0",
      },
      servers: [
        {
          url: "http://localhost:4000",
          description: "Local Development Server",
        },
      ],
      tags: [
        { name: "Health", description: "Health check and diagnostics" },
        { name: "Projects", description: "Project management operations" },
        { name: "Scans", description: "Scan triggers and results" },
      ],
    },
    transform: jsonSchemaTransform,
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
    staticCSP: true,
  });
}
