import { chromium, type Browser, type BrowserContext } from "playwright";

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

export interface PageTestResult {
  url: string;
  httpStatus: number | null;
  loadTimeMs: number;
  ttfbMs?: number;
  domContentLoadedMs?: number;
  screenshotBuffer?: Buffer;
  screenshotBase64?: string;
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

  async testRoute(url: string, captureScreenshot = true): Promise<PageTestResult> {
    await this.init();

    const context: BrowserContext = await this.browser!.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent:
        process.env.BROWSER_USER_AGENT ||
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

    await context.close();

    return {
      url,
      httpStatus,
      loadTimeMs,
      html,
      screenshotBuffer,
      consoleEvents,
      runtimeErrors,
      networkRequests
    };
  }
}
