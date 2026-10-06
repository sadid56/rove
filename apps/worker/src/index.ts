import { WORKER_PORT, WORKER_HOST, MAX_CONCURRENT_SCANS, NODE_ENV } from "@repo/config";
import { db } from "@repo/database";
import { scans } from "@repo/database/schema";
import { eq } from "drizzle-orm";
import { runScan } from "./runner";
import { logger } from "@repo/config";
import { createWorkerServer } from "./server";

const runningScans = new Set<string>();

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

    await db
      .update(scans)
      .set({ status: "discovering", startedAt: new Date() })
      .where(eq(scans.id, scan.id as any));

    logger.worker(
      `🚀 [Slot ${runningScans.size}/${MAX_CONCURRENT_SCANS}] Dispatched concurrent scan [${scan.id.slice(0, 8)}] -> ${scan.targetUrl}`
    );

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
    logger.banner({
      title: "ROVE QA WORKER & BROWSER ENGINE",
      port: WORKER_PORT,
      concurrency: MAX_CONCURRENT_SCANS,
      environment: NODE_ENV,
    });
    logger.success(`Worker HTTP server listening on http://${WORKER_HOST}:${WORKER_PORT}`);
  } catch (err) {

    logger.error(`Failed to bind worker HTTP server on port ${WORKER_PORT}:`, err);
  }

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

if (NODE_ENV !== "test") {
  startWorkerServer();
}

export * from "./runner";
export * from "./server";
export * from "./storage/r2";

