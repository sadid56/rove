import chalk from "chalk";

export type LogLevel = "info" | "success" | "warn" | "error" | "debug" | "event";

export interface LoggerOptions {
  prefix?: string;
}

class Logger {
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

  private formatMessage(badge: string, message: string, ...args: unknown[]): string {
    const timestamp = this.getTimestamp();
    const prefixStr = this.prefix ? chalk.bold.cyan(`[${this.prefix}] `) : "";
    return `${timestamp} ${badge} ${prefixStr}${message}`;
  }

  info(message: string, ...args: unknown[]) {
    const badge = chalk.bgCyan.black.bold(" INFO ");
    console.log(this.formatMessage(badge, chalk.white(message)), ...args);
  }

  success(message: string, ...args: unknown[]) {
    const badge = chalk.bgGreen.black.bold(" SUCCESS ");
    console.log(this.formatMessage(badge, chalk.greenBright(message)), ...args);
  }

  warn(message: string, ...args: unknown[]) {
    const badge = chalk.bgYellow.black.bold(" WARN ");
    console.warn(this.formatMessage(badge, chalk.yellow(message)), ...args);
  }

  error(message: string, error?: unknown, ...args: unknown[]) {
    const badge = chalk.bgRed.white.bold(" ERROR ");
    console.error(this.formatMessage(badge, chalk.redBright(message)), ...args);
    if (error instanceof Error && error.stack) {
      console.error(chalk.gray(error.stack));
    } else if (error) {
      console.error(chalk.red(JSON.stringify(error, null, 2)));
    }
  }

  debug(message: string, ...args: unknown[]) {
    if (process.env.NODE_ENV === "production") return;
    const badge = chalk.bgMagenta.black.bold(" DEBUG ");
    console.debug(this.formatMessage(badge, chalk.magenta(message)), ...args);
  }

  event(eventName: string, details?: string) {
    const badge = chalk.bgBlue.white.bold(" EVENT ");
    const det = details ? chalk.gray(` (${details})`) : "";
    console.log(this.formatMessage(badge, chalk.bold.blueBright(eventName) + det));
  }

  scan(route: string, status: "healthy" | "warning" | "failed", durationMs?: number) {
    const badge = chalk.bgHex("#06b6d4").black.bold(" SCAN ");
    const statusMap = {
      healthy: chalk.greenBright("✓ HEALTHY"),
      warning: chalk.yellowBright("⚠ WARNING"),
      failed: chalk.redBright("✗ FAILED"),
    };
    const dur = durationMs ? chalk.gray(` in ${durationMs}ms`) : "";
    console.log(
      this.formatMessage(
        badge,
        `${chalk.bold(route)} ➜ ${statusMap[status]}${dur}`
      )
    );
  }

  banner({
    title = "ROVE API ENGINE",
    port,
    docsPath = "/docs",
    environment = "development",
  }: {
    title?: string;
    port: number | string;
    docsPath?: string;
    environment?: string;
  }) {
    const localUrl = `http://localhost:${port}`;
    const docsUrl = `${localUrl}${docsPath}`;

    const line = chalk.cyan("─".repeat(50));
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
        `  ${chalk.gray("➜")}  ${chalk.bold("API Server:")}  ${chalk.cyanBright(localUrl)}`.padEnd(58) +
        chalk.cyan("│")
    );
    console.log(
      chalk.cyan("│") +
        `  ${chalk.gray("➜")}  ${chalk.bold("OpenAPI/Docs:")} ${chalk.greenBright(docsUrl)}`.padEnd(58) +
        chalk.cyan("│")
    );
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
