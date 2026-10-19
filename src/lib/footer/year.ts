import { cacheLife } from "next/cache";

/**
 * The copyright year is safe to prerender, but must not be read directly
 * during a Server Component render when cacheComponents is enabled.
 * Refresh daily so a new year appears without a redeploy.
 */
export async function getFooterCopyrightYear(): Promise<number> {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 86400, expire: 172800 });
  return new Date().getUTCFullYear();
}
