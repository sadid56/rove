const CDN_URL = (
  process.env.NEXT_PUBLIC_CDN_URL ||
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
  ""
).replace(/\/+$/, "");

export function getMediaUrl(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return CDN_URL ? `${CDN_URL}${cleanPath}` : cleanPath;
}
