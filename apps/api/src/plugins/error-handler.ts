import type { FastifyError, FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { env } from "../config/env";
import { logger } from "@repo/config";


export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    logger.error(`${request.method} ${request.url} failed`, error);


    if (error instanceof ZodError) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: error.flatten().fieldErrors,
        },
      });
    }

    if (error.validation) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: error.message,
          details: error.validation,
        },
      });
    }

    const statusCode = error.statusCode ?? 500;

    return reply.status(statusCode).send({
      success: false,
      error: {
        code: error.code || "INTERNAL_SERVER_ERROR",
        message:
          statusCode === 500 && env.NODE_ENV === "production"
            ? "An unexpected internal server error occurred"
            : error.message,
        ...(env.NODE_ENV === "development" && { stack: error.stack }),
      },
    });
  });
}
