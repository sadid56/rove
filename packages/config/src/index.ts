import dotenv from "dotenv";
import * as fs from "node:fs";
import * as path from "node:path";

function findMonorepoRoot(startDir: string): string {
  let cur = path.resolve(startDir);
  while (cur !== path.parse(cur).root) {
    if (fs.existsSync(path.join(cur, "pnpm-workspace.yaml")) || fs.existsSync(path.join(cur, "turbo.json"))) {
      return cur;
    }
    cur = path.dirname(cur);
  }
  return startDir;
}

export const rootDir = (() => {
  const fromMeta = typeof import.meta?.dirname === "string" ? findMonorepoRoot(import.meta.dirname) : "";
  if (fromMeta && fs.existsSync(path.join(fromMeta, "pnpm-workspace.yaml"))) {
    return fromMeta;
  }
  const fromCwd = findMonorepoRoot(process.cwd());
  if (fromCwd && fs.existsSync(path.join(fromCwd, "pnpm-workspace.yaml"))) {
    return fromCwd;
  }
  return fromCwd || process.cwd();
})();

const envLocalPath = path.resolve(rootDir, ".env.local");
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
  if (typeof process.loadEnvFile === "function") {
    try { process.loadEnvFile(envLocalPath); } catch {}
  }
}

const envPath = path.resolve(rootDir, ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  if (typeof process.loadEnvFile === "function") {
    try { process.loadEnvFile(envPath); } catch {}
  }
}

export interface EnvironmentVariables {
  NODE_ENV: "development" | "production" | "test";

  // Database & Supabase
  DATABASE_URL: string;

  // Fastify API Gateway
  PORT: number;
  HOST: string;
  CORS_ORIGIN: string;
  LOG_LEVEL: string;
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;

  // Worker Crawler Engine
  WORKER_PORT: number;
  WORKER_HOST: string;
  WORKER_URL: string;
  MAX_CONCURRENT_SCANS: number;
  DEFAULT_MAX_PAGES: number;
  BROWSER_USER_AGENT: string;

  // Google Gemini AI Diagnostics
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;

  // Cloudflare R2 / Object Storage
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_BUCKET_NAME: string;
  R2_PUBLIC_URL: string;

  // Next.js Web App
  API_URL: string;
  NEXT_PUBLIC_APP_URL: string;
  NEXT_PUBLIC_CDN_URL: string;
  NEXT_PUBLIC_R2_PUBLIC_URL: string;
}

function sanitizeDatabaseUrl(urlStr: string): string {

  if (!urlStr) return urlStr;
  try {
    new URL(urlStr);
    return urlStr;
  } catch {
    const protoMatch = urlStr.match(/^(postgres(?:ql)?:\/\/)/);
    if (!protoMatch) return urlStr;
    const proto = protoMatch[1]!;
    const afterProto = urlStr.slice(proto.length);
    const lastAtIndex = afterProto.lastIndexOf("@");
    if (lastAtIndex === -1) return urlStr;

    const credentials = afterProto.slice(0, lastAtIndex);
    const hostAndDb = afterProto.slice(lastAtIndex + 1);

    const firstColonIndex = credentials.indexOf(":");
    if (firstColonIndex === -1) return urlStr;

    const user = credentials.slice(0, firstColonIndex);
    const pass = credentials.slice(firstColonIndex + 1);

    let safePass = pass;
    try {
      safePass = encodeURIComponent(decodeURIComponent(pass));
    } catch {
      safePass = encodeURIComponent(pass);
    }

    return `${proto}${user}:${safePass}@${hostAndDb}`;
  }
}

const raw = process.env;

const NODE_ENV = (raw.NODE_ENV || "development") as "development" | "production" | "test";
const DATABASE_URL = sanitizeDatabaseUrl(raw.DATABASE_URL || "");

const PORT = Number(raw.PORT || 4000);
const HOST = raw.HOST || "0.0.0.0";
const CORS_ORIGIN = raw.CORS_ORIGIN || "*";
const LOG_LEVEL = raw.LOG_LEVEL || "info";
const BETTER_AUTH_URL = raw.BETTER_AUTH_URL || "http://localhost:4000";
const BETTER_AUTH_SECRET = raw.BETTER_AUTH_SECRET || "";

const WORKER_PORT = Number(raw.WORKER_PORT || 4001);
const WORKER_HOST = raw.WORKER_HOST || "0.0.0.0";
const WORKER_URL = raw.WORKER_URL || "http://localhost:4001";
const MAX_CONCURRENT_SCANS = Number(raw.MAX_CONCURRENT_SCANS || 3);
const DEFAULT_MAX_PAGES = Number(raw.DEFAULT_MAX_PAGES || 100);
const BROWSER_USER_AGENT = raw.BROWSER_USER_AGENT || "";

const GEMINI_API_KEY = raw.GEMINI_API_KEY || "";
const GEMINI_MODEL = raw.GEMINI_MODEL || "gemini-3.5-flash-lite";

const R2_ACCOUNT_ID = raw.R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = raw.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = raw.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = raw.R2_BUCKET_NAME || "rove-screenshots";
const R2_PUBLIC_URL = (raw.R2_PUBLIC_URL || "").replace(/\/+$/, "");

const API_URL = raw.API_URL || "http://localhost:4000";
const NEXT_PUBLIC_APP_URL = raw.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const NEXT_PUBLIC_CDN_URL = (raw.NEXT_PUBLIC_CDN_URL || "http://localhost:4001").replace(/\/+$/, "");
const NEXT_PUBLIC_R2_PUBLIC_URL = (raw.NEXT_PUBLIC_R2_PUBLIC_URL || "").replace(/\/+$/, "");

export const appConfig = (): EnvironmentVariables => ({
  NODE_ENV,
  DATABASE_URL,
  PORT,
  HOST,
  CORS_ORIGIN,
  LOG_LEVEL,
  BETTER_AUTH_URL,
  BETTER_AUTH_SECRET,
  WORKER_PORT,
  WORKER_HOST,
  WORKER_URL,
  MAX_CONCURRENT_SCANS,
  DEFAULT_MAX_PAGES,
  BROWSER_USER_AGENT,
  GEMINI_API_KEY,
  GEMINI_MODEL,
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
  API_URL,
  NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_CDN_URL,
  NEXT_PUBLIC_R2_PUBLIC_URL,
});

export const config = appConfig();

export {
  NODE_ENV,
  DATABASE_URL,
  PORT,
  HOST,
  CORS_ORIGIN,
  LOG_LEVEL,
  BETTER_AUTH_URL,
  BETTER_AUTH_SECRET,
  WORKER_PORT,
  WORKER_HOST,
  WORKER_URL,
  MAX_CONCURRENT_SCANS,
  DEFAULT_MAX_PAGES,
  BROWSER_USER_AGENT,
  GEMINI_API_KEY,
  GEMINI_MODEL,
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
  API_URL,
  NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_CDN_URL,
  NEXT_PUBLIC_R2_PUBLIC_URL,
  sanitizeDatabaseUrl,
};

export * from "./logger";


