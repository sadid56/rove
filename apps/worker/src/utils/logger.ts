import { EventEmitter } from "node:events";

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m"
};

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "worker" | "crawler" | "test" | "healthy" | "warning" | "failed" | "complete" | "error";
  message: string;
  data?: any;
}

export const logEmitter = new EventEmitter();
logEmitter.setMaxListeners(100);

export const recentLogs: LogEntry[] = [];
const MAX_LOGS = 300;

function recordLog(level: LogEntry["level"], message: string, data?: any) {
  const entry: LogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    level,
    message,
    data
  };

  recentLogs.push(entry);
  if (recentLogs.length > MAX_LOGS) {
    recentLogs.shift();
  }

  logEmitter.emit("log", entry);
}

function timeStr(): string {
  return new Date().toLocaleTimeString("en-US", { hour12: false });
}

export const logger = {
  info: (msg: string, ...args: any[]) => {
    recordLog("info", msg, args[0]);
    console.log(`${c.gray}[${timeStr()}]${c.reset} ${c.blue}ℹ${c.reset} ${msg}`, ...args);
  },
  worker: (msg: string, ...args: any[]) => {
    recordLog("worker", msg, args[0]);
    console.log(`${c.gray}[${timeStr()}]${c.reset} ${c.magenta}${c.bold}[WORKER]${c.reset} ${msg}`, ...args);
  },
  discover: (msg: string, ...args: any[]) => {
    recordLog("crawler", msg, args[0]);
    console.log(`${c.gray}[${timeStr()}]${c.reset} ${c.cyan}${c.bold}[CRAWLER]${c.reset} ${msg}`, ...args);
  },
  test: (index: number, total: number, url: string) => {
    recordLog("test", `Testing [${index}/${total}] ${url}`, { index, total, url });
    console.log(
      `${c.gray}[${timeStr()}]${c.reset} ${c.yellow}${c.bold}[TESTING ${index}/${total}]${c.reset} ${c.white}${url}${c.reset}`
    );
  },
  healthy: (path: string, status: number | null, timeMs: number | null) => {
    recordLog("healthy", `${status ?? 200} OK (${timeMs ?? 0}ms): ${path}`, { path, status, timeMs });
    console.log(
      `${c.gray}[${timeStr()}]${c.reset}   ${c.green}✔ HEALTHY${c.reset}  ${c.dim}${status ?? "---"}${c.reset}  ${c.cyan}${timeMs ?? 0}ms${c.reset}  ${path}`
    );
  },
  warning: (path: string, reasons: string[], status: number | null, timeMs: number | null) => {
    recordLog("warning", `Warning (${reasons.join(", ")}): ${path}`, { path, reasons, status, timeMs });
    console.log(
      `${c.gray}[${timeStr()}]${c.reset}   ${c.yellow}⚠ WARNING${c.reset}  ${c.dim}${status ?? "---"}${c.reset}  ${c.cyan}${timeMs ?? 0}ms${c.reset}  ${path} ${c.yellow}(${reasons.join(", ")})${c.reset}`
    );
  },
  failed: (path: string, reasons: string[], status: number | null, timeMs: number | null) => {
    recordLog("failed", `Failed (${reasons.join(", ")}): ${path}`, { path, reasons, status, timeMs });
    console.log(
      `${c.gray}[${timeStr()}]${c.reset}   ${c.red}${c.bold}✖ FAILED${c.reset}   ${c.dim}${status ?? "---"}${c.reset}  ${c.cyan}${timeMs ?? 0}ms${c.reset}  ${path} ${c.red}${c.bold}(${reasons.join(", ")})${c.reset}`
    );
  },
  complete: (url: string, stats: { score: number; total: number; healthy: number; failed: number; durationSec: number }) => {
    recordLog("complete", `Scan completed for ${url} (Score: ${stats.score}/100)`, stats);
    console.log("\n" + `${c.green}${c.bold}══════════════════════════════════════════════════════════════════${c.reset}`);
    console.log(`${c.green}${c.bold}  🎉 SCAN COMPLETED:${c.reset} ${c.white}${c.bold}${url}${c.reset}`);
    console.log(`  ${c.cyan}Health Score:${c.reset} ${c.bold}${stats.score}/100${c.reset}`);
    console.log(`  ${c.cyan}Tested Routes:${c.reset} ${stats.total} (Healthy: ${c.green}${stats.healthy}${c.reset}, Failed: ${c.red}${stats.failed}${c.reset})`);
    console.log(`  ${c.cyan}Duration:${c.reset} ${stats.durationSec.toFixed(1)}s`);
    console.log(`${c.green}${c.bold}══════════════════════════════════════════════════════════════════${c.reset}\n`);
  },
  error: (msg: string, ...args: any[]) => {
    recordLog("error", msg, args[0]);
    console.error(`${c.gray}[${timeStr()}]${c.reset} ${c.red}${c.bold}[ERROR]${c.reset} ${msg}`, ...args);
  }
};
