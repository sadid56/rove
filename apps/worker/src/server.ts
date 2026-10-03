import fastify from "fastify";
import cors from "@fastify/cors";
import { recentLogs, logEmitter, logger, type LogEntry } from "./utils/logger";
import { runScan } from "./runner";
import { db } from "@repo/database";
import { scans } from "@repo/database/schema";
import { eq } from "drizzle-orm";

export interface ActiveJob {
  scanId: string;
  targetUrl: string;
  startedAt: Date;
}

const activeJobs = new Map<string, ActiveJob>();
const cancelledScans = new Set<string>();

export function addActiveJob(job: { scanId: string; targetUrl: string }) {
  cancelledScans.delete(job.scanId);
  activeJobs.set(job.scanId, { ...job, startedAt: new Date() });
}

export function removeActiveJob(scanId: string) {
  activeJobs.delete(scanId);
}

export function markScanCancelled(scanId: string) {
  cancelledScans.add(scanId);
}

export function isScanCancelled(scanId: string): boolean {
  return cancelledScans.has(scanId);
}

export function getActiveJobs(): ActiveJob[] {
  return Array.from(activeJobs.values());
}

export async function createWorkerServer() {
  const app = fastify({
    logger: false
  });

  await app.register(cors, {
    origin: true,
    credentials: true
  });

  app.get("/", async () => {
    const jobs = getActiveJobs();
    return {
      service: "rove-worker",
      status: "operational",
      port: Number(process.env.WORKER_PORT || 4001),
      maxConcurrentScans: Number(process.env.MAX_CONCURRENT_SCANS || 3),
      activeJobsCount: jobs.length,
      activeJobs: jobs,
      uptimeSec: Math.floor(process.uptime())
    };
  });

  app.get("/health", async () => {
    const jobs = getActiveJobs();
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptimeSec: Math.floor(process.uptime()),
      memoryMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      activeJobsCount: jobs.length,
      activeJobs: jobs
    };
  });

  app.get("/status", async () => {
    const queued = await db
      .select()
      .from(scans)
      .where(eq(scans.status, "queued"));

    const running = await db
      .select()
      .from(scans)
      .where(eq(scans.status, "scanning"));

    const jobs = getActiveJobs();
    return {
      activeJobsCount: jobs.length,
      activeJobs: jobs,
      queueCount: queued.length,
      runningCount: running.length,
      recentLogsCount: recentLogs.length
    };
  });

  app.post<{ Body: { scanId?: string; targetUrl?: string } }>("/jobs/run", async (req, reply) => {
    const { scanId, targetUrl } = req.body || {};

    if (!scanId && !targetUrl) {
      return reply.status(400).send({
        error: "Missing required parameter: scanId or targetUrl"
      });
    }

    let targetScanId = scanId;

    if (!targetScanId && targetUrl) {
      const [created] = await db
        .insert(scans)
        .values({
          targetUrl,
          status: "queued"
        })
        .returning();
      targetScanId = created?.id;
    }

    if (!targetScanId) {
      return reply.status(500).send({ error: "Failed to create or find scan" });
    }

    runScan(targetScanId).catch((err) => {
      logger.error(`Error executing scan [${targetScanId}]:`, err);
    });

    return reply.status(202).send({
      message: "Scan job accepted and dispatched to browser engine",
      scanId: targetScanId
    });
  });

  app.post("/jobs/cancel", async (request, reply) => {
    const { scanId } = request.body as { scanId?: string };
    if (!scanId) {
      return reply.status(400).send({ error: "scanId is required" });
    }
    markScanCancelled(scanId);
    removeActiveJob(scanId);
    await db
      .update(scans)
      .set({ status: "cancelled", completedAt: new Date() })
      .where(eq(scans.id, scanId as any));
    logger.worker(`Scan [${scanId}] was cancelled by user.`);
    return reply.send({ success: true, message: `Scan ${scanId} cancelled successfully` });
  });

  app.get("/logs", async (req) => {
    const limit = Number((req.query as any)?.limit || 100);
    return {
      total: recentLogs.length,
      logs: recentLogs.slice(-limit)
    };
  });

  app.get("/logs/stream", (request, reply) => {
    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.setHeader("Access-Control-Allow-Origin", "*");

    const initialLogs = recentLogs.slice(-30);
    for (const log of initialLogs) {
      reply.raw.write(`data: ${JSON.stringify(log)}\n\n`);
    }

    const onLog = (log: LogEntry) => {
      reply.raw.write(`data: ${JSON.stringify(log)}\n\n`);
    };

    logEmitter.on("log", onLog);

    request.raw.on("close", () => {
      logEmitter.off("log", onLog);
    });
  });

  return app;
}
