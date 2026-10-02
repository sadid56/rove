import "dotenv/config";
import { db } from "@repo/database";
import { scans } from "@repo/database/schema";
import { eq, inArray } from "drizzle-orm";
import { runScan } from "./runner";
import { logger } from "./utils/logger";
import { createWorkerServer } from "./server";

const WORKER_PORT = Number(process.env.WORKER_PORT || 4001);
const WORKER_HOST = process.env.WORKER_HOST || "0.0.0.0";
const MAX_CONCURRENT_SCANS = Number(process.env.MAX_CONCURRENT_SCANS || 3);

const runningScans = new Set<string>();

/**
 * Checks the database for queued scans and executes up to MAX_CONCURRENT_SCANS in parallel.
 * Multiple users triggering scans simultaneously will run concurrently without blocking each other.
 */
export async function processAvailableJobs(): Promise<void> {
  const availableSlots = MAX_CONCURRENT_SCANS - runningScans.size;
  if (availableSlots <= 0) {
    return;
  }

  const queuedScans = await db
    .select()
    .from(scans)
    .where(eq(scans.status, "queued"))
    .limit(availableSlots);

  if (queuedScans.length === 0) {
    return;
  }

  for (const scan of queuedScans) {
    if (runningScans.has(scan.id)) continue;
    runningScans.add(scan.id);

    // Atomically claim the scan so another cycle doesn't pick it up
    await db
      .update(scans)
      .set({ status: "discovering", startedAt: new Date() })
      .where(eq(scans.id, scan.id as any));

    logger.worker(
      `🚀 [Slot ${runningScans.size}/${MAX_CONCURRENT_SCANS}] Dispatched concurrent scan [${scan.id.slice(0, 8)}] -> ${scan.targetUrl}`
    );

    // Execute asynchronously in parallel
    runScan(scan.id)
      .catch((err) => {
        logger.error(`Concurrent scan [${scan.id}] execution error:`, err);
      })
      .finally(() => {
        runningScans.delete(scan.id);
      });
  }
}

export async function startWorkerServer(): Promise<void> {
  const app = await createWorkerServer();

  try {
    await app.listen({ port: WORKER_PORT, host: WORKER_HOST });
    logger.worker(`Worker HTTP Server listening at http://localhost:${WORKER_PORT}`);
    logger.worker(`  ├── Concurrency:  ${MAX_CONCURRENT_SCANS} simultaneous scan jobs`);
    logger.worker(`  ├── Health:       http://localhost:${WORKER_PORT}/health`);
    logger.worker(`  ├── Status:       http://localhost:${WORKER_PORT}/status`);
    logger.worker(`  ├── Recent Logs:  http://localhost:${WORKER_PORT}/logs`);
    logger.worker(`  └── Live Stream:  http://localhost:${WORKER_PORT}/logs/stream (SSE)`);
  } catch (err) {
    logger.error(`Failed to bind worker HTTP server on port ${WORKER_PORT}:`, err);
  }

  // Polling loop to pick up new scans as soon as concurrency slots open
  const loop = async () => {
    try {
      await processAvailableJobs();
    } catch (err) {
      logger.error("Worker polling error:", err);
    } finally {
      setTimeout(loop, 2000);
    }
  };

  loop();
}

if (process.env.NODE_ENV !== "test") {
  startWorkerServer();
}

export * from "./runner";
export * from "./server";
export * from "./utils/logger";
export * from "./storage/r2";
