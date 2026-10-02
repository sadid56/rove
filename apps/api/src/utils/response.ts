import type { FastifyReply, FastifyRequest } from "fastify";

export interface ApiResponseOptions<T = unknown> {
  statusCode?: number;
  success?: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorOptions {
  statusCode?: number;
  message?: string;
  code?: string;
  errors?: unknown;
}

export function sendResponse<T>(
  reply: FastifyReply,
  options: ApiResponseOptions<T> = {}
) {
  const {
    statusCode = 200,
    success = true,
    message = "Operation successful",
    data,
    meta
  } = options;

  return reply.status(statusCode).send({
    success,
    statusCode,
    message,
    data: data ?? null,
    ...(meta ? { meta } : {})
  });
}

export function sendError(
  reply: FastifyReply,
  options: ApiErrorOptions = {}
) {
  const {
    statusCode = 500,
    message = "Internal server error",
    code,
    errors
  } = options;

  return reply.status(statusCode).send({
    success: false,
    statusCode,
    message,
    ...(code ? { code } : {}),
    ...(errors ? { errors } : {})
  });
}

export function catchAsync<Req extends FastifyRequest = FastifyRequest>(
  fn: (request: Req, reply: FastifyReply) => Promise<unknown>
) {
  return async (request: Req, reply: FastifyReply) => {
    try {
      return await fn(request, reply);
    } catch (error: any) {
      request.log.error(error);
      return sendError(reply, {
        statusCode: error.statusCode || error.status || 500,
        message: error.message || "An unexpected error occurred",
        code: error.code
      });
    }
  };
}
