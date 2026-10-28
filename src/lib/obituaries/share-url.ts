/** Absolute, public HTTPS URL needed by Facebook's link-preview crawler. */
function publicOrigin(value: string | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || url.username || url.password) return null;
    if (
      host === "localhost" ||
      host.endsWith(".localhost") ||
      host.endsWith(".local") ||
      host.endsWith(".internal") ||
      host === "[::1]" ||
      host === "::1" ||
      /^(?:127|10)\.\d+\.\d+\.\d+$/.test(host) ||
      /^192\.168\.\d+\.\d+$/.test(host) ||
      /^169\.254\.\d+\.\d+$/.test(host) ||
      /^172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(host)
    ) return null;
    return url.origin;
  } catch {
    return null;
  }
}

/**
 * Use the configured canonical site (including during local testing).
 * Otherwise accept the current origin only when it is already public HTTPS.
 * Never pass localhost or a LAN address to the Facebook share dialog.
 */
export function resolveObituaryShareUrl(slug: string, origin: string, configuredSiteUrl?: string): string | null {
  if (!slug.trim()) return null;
  const site = publicOrigin(configuredSiteUrl) ?? publicOrigin(origin);
  return site ? new URL(`/nekrologi/${encodeURIComponent(slug)}`, site).href : null;
}
