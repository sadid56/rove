import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { BROWSER_USER_AGENT } from "@repo/config";


export interface ConsoleCapturedEvent {
  type: "error" | "warn" | "info" | "log";
  message: string;
  location?: string;
  stack?: string;
  timestamp: Date;
}

export interface RuntimeCapturedError {
  errorType: "uncaught" | "unhandled_rejection" | "hydration";
  message: string;
  source?: string;
  line?: number;
  stack?: string;
}

export interface NetworkCapturedRequest {
  url: string;
  method: string;
  status?: number;
  resourceType: string;
  durationMs?: number;
  failed: boolean;
  failureReason?: string;
}

export interface PageTestOptions {
  captureScreenshot?: boolean;
  recordVideo?: boolean;
  autoScroll?: boolean;
  scrollDurationMs?: number;
}

export interface PageTestResult {
  url: string;
  httpStatus: number | null;
  loadTimeMs: number;
  ttfbMs?: number;
  domContentLoadedMs?: number;
  screenshotBuffer?: Buffer;
  screenshotBase64?: string;
  videoBuffer?: Buffer;
  html: string;
  consoleEvents: ConsoleCapturedEvent[];
  runtimeErrors: RuntimeCapturedError[];
  networkRequests: NetworkCapturedRequest[];
}

export class BrowserEngine {
  private browser: Browser | null = null;

  async init(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
      });
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async testRoute(
    url: string,
    optionsInput: boolean | PageTestOptions = true
  ): Promise<PageTestResult> {
    await this.init();

    const captureScreenshot =
      typeof optionsInput === "boolean"
        ? optionsInput
        : optionsInput.captureScreenshot ?? true;
    const shouldRecordVideo =
      typeof optionsInput === "object" ? optionsInput.recordVideo ?? true : true;
    const shouldAutoScroll =
      typeof optionsInput === "object" ? optionsInput.autoScroll ?? true : true;
    const scrollDurationMs =
      typeof optionsInput === "object" ? optionsInput.scrollDurationMs ?? 2000 : 2000;

    let tempVideoDir: string | undefined;
    if (shouldRecordVideo) {
      tempVideoDir = path.join(
        os.tmpdir(),
        `rove-vid-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      );
      await fs.mkdir(tempVideoDir, { recursive: true }).catch(() => {});
    }

    const context: BrowserContext = await this.browser!.newContext({
      viewport: { width: 1440, height: 900 },
      recordVideo: tempVideoDir
        ? { dir: tempVideoDir, size: { width: 1280, height: 720 } }
        : undefined,
      userAgent:
        BROWSER_USER_AGENT ||
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      locale: "en-US",
      extraHTTPHeaders: {
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Ch-Ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"'
      }
    });

    const page = await context.newPage();

    const consoleEvents: ConsoleCapturedEvent[] = [];
    const runtimeErrors: RuntimeCapturedError[] = [];
    const networkRequests: NetworkCapturedRequest[] = [];
    const requestTimings = new Map<string, number>();

    page.on("console", (msg) => {
      const type = msg.type();
      const level =
        type === "error" ? "error" : type === "warning" ? "warn" : type === "info" ? "info" : "log";

      const location = msg.location();
      const locString = location.url ? `${location.url}:${location.lineNumber}` : undefined;

      consoleEvents.push({
        type: level,
        message: msg.text(),
        location: locString,
        timestamp: new Date()
      });
    });

    page.on("pageerror", (err) => {
      const msg = err.message || String(err);
      const isHydration = msg.toLowerCase().includes("hydration") || msg.toLowerCase().includes("minified react error #418") || msg.toLowerCase().includes("minified react error #423");

      runtimeErrors.push({
        errorType: isHydration ? "hydration" : "uncaught",
        message: msg,
        stack: err.stack
      });
    });

    page.on("request", (req) => {
      requestTimings.set(req.url(), Date.now());
    });

    page.on("requestfailed", (req) => {
      const startTime = requestTimings.get(req.url()) ?? Date.now();
      networkRequests.push({
        url: req.url(),
        method: req.method(),
        resourceType: req.resourceType(),
        durationMs: Date.now() - startTime,
        failed: true,
        failureReason: req.failure()?.errorText || "Request failed"
      });
    });

    page.on("response", (res) => {
      const startTime = requestTimings.get(res.url()) ?? Date.now();
      const status = res.status();
      const failed = status >= 400;

      networkRequests.push({
        url: res.url(),
        method: res.request().method(),
        status,
        resourceType: res.request().resourceType(),
        durationMs: Date.now() - startTime,
        failed,
        failureReason: failed ? `HTTP ${status}` : undefined
      });
    });

    const startTime = Date.now();
    let httpStatus: number | null = null;
    let html = "";
    let screenshotBuffer: Buffer | undefined;

    try {
      const response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 15000
      });

      httpStatus = response?.status() ?? null;

      await page.waitForLoadState("networkidle", { timeout: 3500 }).catch(() => {});
      html = await page.content();

      if (captureScreenshot) {
        screenshotBuffer = await page.screenshot({ fullPage: false, type: "jpeg", quality: 75 }).catch(() => undefined);
      }

      if (shouldRecordVideo && shouldAutoScroll) {
        await this.performSmoothAutoScroll(page, scrollDurationMs);
      } else if (shouldRecordVideo) {
        await page.waitForTimeout(500).catch(() => {});
      }
    } catch (err: any) {
      if (!httpStatus) {
        httpStatus = 504;
      }
      runtimeErrors.push({
        errorType: "uncaught",
        message: err.message || "Page navigation timeout or failure"
      });
      try {
        html = await page.content();
      } catch {
        html = "";
      }
      if (captureScreenshot && !screenshotBuffer) {
        screenshotBuffer = await page.screenshot({ fullPage: false, type: "jpeg", quality: 75 }).catch(() => undefined);
      }
    }

    const loadTimeMs = Date.now() - startTime;

    const pageVideo = page.video();
    await page.close().catch(() => {});
    await context.close().catch(() => {});

    let videoBuffer: Buffer | undefined;
    if (tempVideoDir && pageVideo) {
      try {
        const videoPath = await pageVideo.path().catch(() => null);
        if (videoPath) {
          videoBuffer = await fs.readFile(videoPath).catch(() => undefined);
          await fs.unlink(videoPath).catch(() => {});
        }
      } catch {
        // Cleanup error ignored
      } finally {
        await fs.rm(tempVideoDir, { recursive: true, force: true }).catch(() => {});
      }
    }

    return {
      url,
      httpStatus,
      loadTimeMs,
      html,
      screenshotBuffer,
      videoBuffer,
      consoleEvents,
      runtimeErrors,
      networkRequests
    };
  }

  private async performSmoothAutoScroll(page: Page, durationMs = 2000): Promise<void> {
    try {
      await page.evaluate(async (maxDuration: number) => {
        await new Promise<void>((resolve) => {
          const totalHeight = Math.max(
            document.body.scrollHeight || 0,
            document.documentElement.scrollHeight || 0,
            document.body.offsetHeight || 0
          );
          const viewportHeight = window.innerHeight || 900;

          // If the page is not scrollable, pause briefly and finish
          if (totalHeight <= viewportHeight + 60) {
            setTimeout(resolve, 800);
            return;
          }

          const maxScroll = Math.min(totalHeight - viewportHeight, 3500);
          const startTime = performance.now();
          const scrollDownDuration = Math.max(800, maxDuration * 0.7);

          function step(now: number) {
            const elapsed = now - startTime;
            if (elapsed < scrollDownDuration) {
              const progress = elapsed / scrollDownDuration;
              // Smooth quadratic ease-in-out curve
              const ease =
                progress < 0.5
                  ? 2 * progress * progress
                  : 1 - Math.pow(-2 * progress + 2, 2) / 2;
              window.scrollTo(0, ease * maxScroll);
              requestAnimationFrame(step);
            } else {
              // Smoothly glide back to the top
              window.scrollTo({ top: 0, behavior: "smooth" });
              setTimeout(resolve, 400);
            }
          }

          requestAnimationFrame(step);
        });
      }, durationMs);
    } catch {
      // In case evaluate is interrupted or page closed
    }
  }
}

