import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { logger } from "../utils/logger";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || process.env.NEXT_PUBLIC_CDN_URL || "").replace(/\/+$/, "");

const isR2Configured = Boolean(
  R2_ACCOUNT_ID &&
  R2_ACCESS_KEY_ID &&
  R2_SECRET_ACCESS_KEY &&
  R2_BUCKET_NAME
);

let s3Client: S3Client | null = null;

if (isR2Configured) {
  s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID!,
      secretAccessKey: R2_SECRET_ACCESS_KEY!
    }
  });
}

export interface UploadScreenshotOptions {
  buffer: Buffer;
  scanId: string;
  routePath: string;
  contentType?: string;
}

/**
 * Uploads a screenshot to Cloudflare R2 (or local dev storage fallback)
 * and returns ONLY the relative key path (e.g. `/screenshots/2026-10-02/scanId/route.jpeg`)
 * without domain name for flexible zero-downtime CDN domain migration.
 */
export async function uploadScreenshot(options: UploadScreenshotOptions): Promise<string> {
  const { buffer, scanId, routePath, contentType = "image/jpeg" } = options;

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const cleanScanId = scanId.slice(0, 8);
  const hash = crypto.createHash("md5").update(routePath + buffer.length).digest("hex").slice(0, 8);
  const safePathSlug = routePath.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 30) || "index";
  const extension = contentType.includes("png") ? "png" : "jpeg";

  // Relative storage key (ONLY this is stored in database)
  const relativeKey = `/screenshots/${dateStr}/${cleanScanId}/${safePathSlug}-${hash}.${extension}`;
  const s3Key = relativeKey.replace(/^\/+/, ""); // R2 / S3 keys do not have leading slash

  if (s3Client && R2_BUCKET_NAME) {
    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: s3Key,
          Body: buffer,
          ContentType: contentType,
          CacheControl: "public, max-age=31536000, immutable"
        })
      );
      logger.info(`Uploaded screenshot to Cloudflare R2: ${relativeKey}`);
      return relativeKey;
    } catch (err) {
      logger.error(`Cloudflare R2 upload failed for ${relativeKey}, falling back to local:`, err);
    }
  }

  // Graceful local disk fallback for dev without Cloudflare credentials
  try {
    const localDir = path.resolve(process.cwd(), "public", "screenshots", dateStr, cleanScanId);
    await fs.mkdir(localDir, { recursive: true });
    const localFilePath = path.join(localDir, `${safePathSlug}-${hash}.${extension}`);
    await fs.writeFile(localFilePath, buffer);
    logger.info(`Saved screenshot locally: ${relativeKey}`);
  } catch (err) {
    logger.error("Failed to write screenshot to local storage:", err);
  }

  return relativeKey;
}

/**
 * Helper to build the full public CDN URL from a relative storage key
 */
export function getStoragePublicUrl(relativeKey: string): string {
  if (!relativeKey) return "";
  if (relativeKey.startsWith("http://") || relativeKey.startsWith("https://") || relativeKey.startsWith("data:")) {
    return relativeKey;
  }
  const cleanKey = relativeKey.startsWith("/") ? relativeKey : `/${relativeKey}`;
  return R2_PUBLIC_URL ? `${R2_PUBLIC_URL}${cleanKey}` : cleanKey;
}
