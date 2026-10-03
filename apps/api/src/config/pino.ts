import type { FastifyServerOptions } from "fastify";
import { env } from "./env";

export function buildPinoLoggerOptions(): FastifyServerOptions["logger"] {
  const isDev = env.NODE_ENV === "development";

  return {
    level: env.LOG_LEVEL,
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "req.headers['set-cookie']",
        "req.body.password",
        "req.body.token",
        "req.body.refreshToken",
        "res.headers['set-cookie']",
      ],
      censor: "[REDACTED]",
    },
    transport: isDev
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss.l",
            ignore: "pid,hostname",
            singleLine: true,
          },
        }
      : undefined,
  };
}
