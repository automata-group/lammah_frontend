/**
 * Dynamic API and Uploader URL resolver.
 * Ensures production domains (e.g. lammah.site) automatically route to https://api.lammah.site
 * instead of failing on localhost:8080 / localhost:8000 when client env vars are absent.
 */

export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (
      host.includes("lammah.site") ||
      (!host.includes("localhost") && !host.includes("127.0.0.1") && !host.endsWith(".local"))
    ) {
      return "https://api.lammah.site";
    }
    if (window.location.port === "8888" || window.location.port === "9090") {
      return window.location.origin;
    }
  }
  if (process.env.NODE_ENV === "production") {
    return "https://api.lammah.site";
  }
  return "http://localhost:8000";
}

export function getUploaderBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_UPLOADER_URL) return process.env.NEXT_PUBLIC_UPLOADER_URL;
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (
      host.includes("lammah.site") ||
      (!host.includes("localhost") && !host.includes("127.0.0.1") && !host.endsWith(".local"))
    ) {
      return "https://api.lammah.site";
    }
    if (window.location.port === "8888" || window.location.port === "9090") {
      return window.location.origin;
    }
  }
  if (process.env.NODE_ENV === "production") {
    return "https://api.lammah.site";
  }
  return "http://localhost:8080";
}
