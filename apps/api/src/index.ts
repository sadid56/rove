import { buildApp } from "./app";
import { env } from "./config/env";
import { logger } from "@repo/config";


async function start() {
  const app = await buildApp();

  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
  for (const signal of signals) {
    process.on(signal, async () => {
      logger.warn(`Received ${signal}. Gracefully shutting down...`);
      try {
        await app.close();
        logger.success("Server closed successfully.");
        process.exit(0);
      } catch (err) {
        logger.error("Error during graceful shutdown", err);
        process.exit(1);
      }
    });
  }

  try {
    const address = await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    logger.banner({
      title: "ROVE QA ENGINE & WEB INTELLIGENCE",
      port: env.PORT,
      environment: env.NODE_ENV,
    });

    logger.success(`Fastify server listening on ${address}`);
  } catch (err) {
    logger.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
