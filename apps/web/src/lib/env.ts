export function getApiUrl(): string {
  const url = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error("API URL is not configured. Please define API_URL or NEXT_PUBLIC_API_URL in your environment.");
  }
  return url.replace(/\/+$/, "");
}

export function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) {
    throw new Error("App URL is not configured. Please define NEXT_PUBLIC_APP_URL in your environment.");
  }
  return url.replace(/\/+$/, "");
}

export function getRpcUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/v1/orpc`;
  }
  return `${getApiUrl()}/v1/orpc`;
}
