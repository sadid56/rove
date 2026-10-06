import { EventEmitter } from "node:events";
import chalk from "chalk";

export type LogLevel =
  | "info"
  | "success"
  | "warn"
  | "error"
  | "debug"
  | "worker"
  | "crawler"
  | "test"
  | "healthy"
  | "warning"
  | "failed"
  | "complete";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

export const logEmitter = new EventEmitter();
logEmitter.setMaxListeners(100);

export const recentLogs: LogEntry[] = [];
const MAX_LOGS = 300;

function recordLog(level: LogLevel, message: string, data?: unknown) {
  const entry: LogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
  };

  recentLogs.push(entry);
  if (recentLogs.length > MAX_LOGS) {
    recentLogs.shift();
  }

  logEmitter.emit("log", entry);
}

export interface LoggerOptions {
  prefix?: string;
}

export class Logger {
  private prefix?: string;

  constructor(options: LoggerOptions = {}) {
    this.prefix = options.prefix;
  }

  private getTimestamp(): string {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return chalk.gray(`[${time}]`);
  }

  private formatMessage(badge: string, message: string): string {
    const timestamp = this.getTimestamp();
    const prefixStr = this.prefix ? chalk.bold.cyan(`[${this.prefix}] `) : "";
    return `${timestamp} ${badge} ${prefixStr}${message}`;
  }

  info(message: string, ...args: unknown[]) {
    recordLog("info", message, args[0]);
    const badge = chalk.bgCyan.black.bold(" INFO ");
    console.log(this.formatMessage(badge, chalk.white(message)), ...args);
  }

  success(message: string, ...args: unknown[]) {
    recordLog("success", message, args[0]);
    const badge = chalk.bgGreen.black.bold(" SUCCESS ");
    console.log(this.formatMessage(badge, chalk.greenBright(message)), ...args);
  }

  warn(message: string, ...args: unknown[]) {
    recordLog("warning", message, args[0]);
    const badge = chalk.bgYellow.black.bold(" WARN ");
    console.warn(this.formatMessage(badge, chalk.yellow(message)), ...args);
  }

  error(message: string, error?: unknown, ...args: unknown[]) {
    recordLog("error", message, error);
    const badge = chalk.bgRed.white.bold(" ERROR ");
    console.error(this.formatMessage(badge, chalk.redBright(message)), ...args);
    if (error instanceof Error && error.stack) {
      console.error(chalk.gray(error.stack));
    } else if (error) {
      console.error(chalk.red(JSON.stringify(error, null, 2)));
    }
  }

  debug(message: string, ...args: unknown[]) {
    const badge = chalk.bgMagenta.black.bold(" DEBUG ");
    console.debug(this.formatMessage(badge, chalk.magenta(message)), ...args);
  }

  worker(message: string, ...args: unknown[]) {
    recordLog("worker", message, args[0]);
    const badge = chalk.bgMagenta.white.bold(" WORKER ");
    console.log(this.formatMessage(badge, chalk.magentaBright(message)), ...args);
  }

  discover(message: string, ...args: unknown[]) {
    recordLog("crawler", message, args[0]);
    const badge = chalk.bgHex("#06b6d4").black.bold(" CRAWLER ");
    console.log(this.formatMessage(badge, chalk.cyanBright(message)), ...args);
  }

  test(index: number, total: number, url: string) {
    recordLog("test", `Testing [${index}/${total}] ${url}`, { index, total, url });
    const badge = chalk.bgYellow.black.bold(" TEST ");
    console.log(
      this.formatMessage(badge, `${chalk.bold(`[${index}/${total}]`)} ${chalk.white(url)}`)
    );
  }

  healthy(path: string, status: number | null, timeMs: number | null) {
    recordLog("healthy", `${status ?? 200} OK (${timeMs ?? 0}ms): ${path}`, { path, status, timeMs });
    const badge = chalk.bgGreen.black.bold(" HEALTHY ");
    const code = chalk.green.bold(String(status ?? 200));
    const dur = timeMs !== null ? chalk.gray(`(${timeMs}ms)`) : "";
    console.log(this.formatMessage(badge, `${chalk.bold(path)} ${code} ${dur}`));
  }

  warning(path: string, reasons: string[], status: number | null, timeMs: number | null) {
    recordLog("warning", `Warning (${reasons.join(", ")}): ${path}`, { path, reasons, status, timeMs });
    const badge = chalk.bgYellow.black.bold(" WARNING ");
    const code = chalk.yellow.bold(String(status ?? "---"));
    const dur = timeMs !== null ? chalk.yellow(`(${timeMs}ms)`) : "";
    const reasonsStr = reasons.length ? chalk.yellow(`- ${reasons.join(", ")}`) : "";
    console.log(this.formatMessage(badge, `${chalk.bold(path)} ${code} ${dur} ${reasonsStr}`));
  }

  failed(path: string, reasons: string[], status: number | null, timeMs: number | null) {
    recordLog("failed", `Failed (${reasons.join(", ")}): ${path}`, { path, reasons, status, timeMs });
    const badge = chalk.bgRed.white.bold(" FAILED ");
    const code = chalk.red.bold(String(status ?? "---"));
    const dur = timeMs !== null ? chalk.red(`(${timeMs}ms)`) : "";
    const reasonsStr = reasons.length ? chalk.redBright(`- ${reasons.join(", ")}`) : "";
    console.log(this.formatMessage(badge, `${chalk.bold(path)} ${code} ${dur} ${reasonsStr}`));
  }

  complete(url: string, stats: { score: number; total: number; healthy: number; failed: number; durationSec: number }) {
    recordLog("complete", `Scan completed for ${url} (Score: ${stats.score}/100)`, stats);
    console.log();
    console.log(chalk.green("┌" + "─".repeat(54) + "┐"));
    console.log(
      chalk.green("│") +
        chalk.bold.greenBright(`  🎉 SCAN COMPLETED: ${url}`.padEnd(52)) +
        chalk.green("│")
    );
    console.log(chalk.green("├" + "─".repeat(54) + "┤"));
    console.log(
      chalk.green("│") +
        `  ${chalk.gray("➜")}  ${chalk.bold("Health Score:")}   ${chalk.cyanBright(`${stats.score}/100`)}`.padEnd(62) +
        chalk.green("│")
    );
    console.log(
      chalk.green("│") +
        `  ${chalk.gray("➜")}  ${chalk.bold("Tested Routes:")}  ${stats.total} (Healthy: ${chalk.green(stats.healthy)}, Failed: ${chalk.red(stats.failed)})`.padEnd(78) +
        chalk.green("│")
    );
    console.log(
      chalk.green("│") +
        `  ${chalk.gray("➜")}  ${chalk.bold("Duration:")}       ${chalk.yellow(`${stats.durationSec.toFixed(1)}s`)}`.padEnd(62) +
        chalk.green("│")
    );
    console.log(chalk.green("└" + "─".repeat(54) + "┘"));
    console.log();
  }

  http(method: string, url: string, status: number, durationMs: number) {
    let methodColored = chalk.bold(method);
    if (method === "GET") methodColored = chalk.cyan.bold(method);
    else if (method === "POST") methodColored = chalk.blueBright.bold(method);
    else if (method === "PATCH") methodColored = chalk.magenta.bold(method);
    else if (method === "DELETE") methodColored = chalk.red.bold(method);
    else if (method === "PUT") methodColored = chalk.yellow.bold(method);

    let statusColored = chalk.bold(String(status));
    let badge = chalk.bgCyan.black.bold(" INFO ");

    if (status < 300) {
      statusColored = chalk.green.bold(String(status));
      badge = chalk.bgCyan.black.bold(" INFO ");
    } else if (status < 400) {
      statusColored = chalk.cyan.bold(String(status));
      badge = chalk.bgCyan.black.bold(" INFO ");
    } else if (status < 500) {
      statusColored = chalk.yellow.bold(String(status));
      badge = chalk.bgYellow.black.bold(" WARN ");
    } else {
      statusColored = chalk.red.bold(String(status));
      badge = chalk.bgRed.white.bold(" ERROR ");
    }

    const durText = `(${durationMs}ms)`;
    const durColored =
      durationMs < 500
        ? chalk.gray(durText)
        : durationMs < 1500
          ? chalk.yellow(durText)
          : chalk.red(durText);

    console.log(
      this.formatMessage(
        badge,
        `${methodColored} ${chalk.white(url)} ${statusColored} ${durColored}`
      )
    );
  }

  banner({
    title = "ROVE ENGINE",
    port,
    docsPath,
    concurrency,
    environment = "development",
  }: {
    title?: string;
    port: number | string;
    docsPath?: string;
    concurrency?: number | string;
    environment?: string;
  }) {
    const localUrl = `http://localhost:${port}`;

    console.log();
    console.log(chalk.cyan("┌" + "─".repeat(50) + "┐"));
    console.log(
      chalk.cyan("│") +
        chalk.bold.hex("#38bdf8")(`  ⚡ ${title.padEnd(46)}`) +
        chalk.cyan("│")
    );
    console.log(chalk.cyan("├" + "─".repeat(50) + "┤"));
    console.log(
      chalk.cyan("│") +
        `  ${chalk.gray("➜")}  ${chalk.bold("Server:")}      ${chalk.cyanBright(localUrl)}`.padEnd(58) +
        chalk.cyan("│")
    );
    if (docsPath) {
      const docsUrl = `${localUrl}${docsPath}`;
      console.log(
        chalk.cyan("│") +
          `  ${chalk.gray("➜")}  ${chalk.bold("OpenAPI/Docs:")} ${chalk.greenBright(docsUrl)}`.padEnd(58) +
          chalk.cyan("│")
      );
    }
    if (concurrency !== undefined) {
      console.log(
        chalk.cyan("│") +
          `  ${chalk.gray("➜")}  ${chalk.bold("Concurrency:")}   ${chalk.magentaBright(`${concurrency} parallel scans`)}`.padEnd(58) +
          chalk.cyan("│")
      );
    }
    console.log(
      chalk.cyan("│") +
        `  ${chalk.gray("➜")}  ${chalk.bold("Environment:")}  ${chalk.yellow(environment)}`.padEnd(58) +
        chalk.cyan("│")
    );
    console.log(chalk.cyan("└" + "─".repeat(50) + "┘"));
    console.log();
  }

  create(prefix: string): Logger {
    return new Logger({ prefix });
  }
}

export const logger = new Logger();
export default logger;
