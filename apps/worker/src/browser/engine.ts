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
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-background-networking",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-breakpad",
          "--disable-component-update",
          "--disable-default-apps",
          "--disable-domain-reliability",
          "--disable-extensions",
          "--disable-hang-monitor",
          "--disable-ipc-flooding-protection",
          "--disable-popup-blocking",
          "--disable-prompt-on-repost",
          "--disable-renderer-backgrounding",
          "--disable-sync",
          "--disable-translate",
          "--metrics-recording-only",
          "--no-first-run",
          "--safebrowsing-disable-auto-update",
          "--password-store=basic",
          "--use-mock-keychain",
        ],
      });
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close().catch(() => {});
      this.browser = null;
    }
  }

  async testRoute(
    url: string,
    optionsInput: boolean | PageTestOptions = true,
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
      typeof optionsInput === "object" ? optionsInput.scrollDurationMs ?? 1800 : 1800;

    let tempVideoDir: string | undefined;
    if (shouldRecordVideo) {
      tempVideoDir = path.join(
        os.tmpdir(),
        `rove-vid-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      );
      await fs.mkdir(tempVideoDir, { recursive: true }).catch(() => {});
    }

    let context: BrowserContext | null = null;
    let page: Page | null = null;

    const consoleEvents: ConsoleCapturedEvent[] = [];
    const runtimeErrors: RuntimeCapturedError[] = [];
    const networkRequests: NetworkCapturedRequest[] = [];
    const requestTimings = new Map<string, number>();

    const startTime = Date.now();
    let httpStatus: number | null = null;
    let html = "";
    let screenshotBuffer: Buffer | undefined;
    let videoBuffer: Buffer | undefined;

    try {
      context = await this.browser!.newContext({
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
          "Sec-Ch-Ua-Platform": '"Windows"',
        },
      });

      page = await context.newPage();

      // Telemetry listeners
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
          timestamp: new Date(),
        });
      });

      page.on("pageerror", (err) => {
        const msg = err.message || String(err);
        const isHydration =
          msg.toLowerCase().includes("hydration") ||
          msg.toLowerCase().includes("minified react error #418") ||
          msg.toLowerCase().includes("minified react error #423");

        runtimeErrors.push({
          errorType: isHydration ? "hydration" : "uncaught",
          message: msg,
          stack: err.stack,
        });
      });

      page.on("request", (req) => {
        requestTimings.set(req.url(), Date.now());
      });

      page.on("requestfailed", (req) => {
        const start = requestTimings.get(req.url()) ?? Date.now();
        requestTimings.delete(req.url());

        networkRequests.push({
          url: req.url(),
          method: req.method(),
          resourceType: req.resourceType(),
          durationMs: Date.now() - start,
          failed: true,
          failureReason: req.failure()?.errorText || "Request failed",
        });
      });

      page.on("response", (res) => {
        const start = requestTimings.get(res.url()) ?? Date.now();
        requestTimings.delete(res.url());

        const status = res.status();
        const failed = status >= 400;

        networkRequests.push({
          url: res.url(),
          method: res.request().method(),
          status,
          resourceType: res.request().resourceType(),
          durationMs: Date.now() - start,
          failed,
          failureReason: failed ? `HTTP ${status}` : undefined,
        });
      });

      // Navigation & Rendering
      const response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      httpStatus = response?.status() ?? null;

      // Smart network idle: wait up to 1.5s for initial hydration without stalling on long-polling/SSE
      await page.waitForLoadState("networkidle", { timeout: 1500 }).catch(() => {});
      html = await page.content();

      // Capture screenshot
      if (captureScreenshot) {
        screenshotBuffer = await page
          .screenshot({ fullPage: false, type: "jpeg", quality: 80 })
          .catch(() => undefined);
      }

      // Smooth scroll if recording video
      if (shouldRecordVideo && shouldAutoScroll) {
        await this.performSmoothAutoScroll(page, scrollDurationMs);
      } else if (shouldRecordVideo) {
        await page.waitForTimeout(300).catch(() => {});
      }
    } catch (err: any) {
      if (!httpStatus) {
        httpStatus = 504;
      }
      runtimeErrors.push({
        errorType: "uncaught",
        message: err.message || "Page navigation timeout or failure",
      });

      if (page) {
        try {
          html = await page.content();
        } catch {
          html = "";
        }
        if (captureScreenshot && !screenshotBuffer) {
          screenshotBuffer = await page
            .screenshot({ fullPage: false, type: "jpeg", quality: 80 })
            .catch(() => undefined);
        }
      }
    } finally {
      // Guaranteed resource cleanup to prevent memory leaks and zombie processes
      let pageVideoPath: string | null = null;
      if (page) {
        const pageVideo = page.video();
        await page.close().catch(() => {});
        if (pageVideo) {
          pageVideoPath = await pageVideo.path().catch(() => null);
        }
      }

      if (context) {
        await context.close().catch(() => {});
      }

      // Read video buffer & delete temp directory
      if (tempVideoDir) {
        try {
          if (pageVideoPath) {
            videoBuffer = await fs.readFile(pageVideoPath).catch(() => undefined);
            await fs.unlink(pageVideoPath).catch(() => {});
          }
        } finally {
          await fs.rm(tempVideoDir, { recursive: true, force: true }).catch(() => {});
        }
      }
    }

    const loadTimeMs = Date.now() - startTime;

    return {
      url,
      httpStatus,
      loadTimeMs,
      html,
      screenshotBuffer,
      videoBuffer,
      consoleEvents,
      runtimeErrors,
      networkRequests,
    };
  }

  private async performSmoothAutoScroll(page: Page, durationMs = 1800): Promise<void> {
    try {
      await page.evaluate(async (maxDuration: number) => {
        await new Promise<void>((resolve) => {
          const totalHeight = Math.max(
            document.body.scrollHeight || 0,
            document.documentElement.scrollHeight || 0,
            document.body.offsetHeight || 0,
          );
          const viewportHeight = window.innerHeight || 900;

          // If the page is not scrollable, finish immediately
          if (totalHeight <= viewportHeight + 60) {
            setTimeout(resolve, 300);
            return;
          }

          const maxScroll = Math.min(totalHeight - viewportHeight, 3000);
          const startTime = performance.now();
          const scrollDownDuration = Math.max(600, maxDuration * 0.7);

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
              setTimeout(resolve, 300);
            }
          }

          requestAnimationFrame(step);
        });
      }, durationMs);
    } catch {
      // Ignore evaluation interruption on page close
    }
  }
}
