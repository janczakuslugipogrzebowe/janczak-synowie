import type { MetadataRoute } from "next";
import { getSitemapObituaries } from "@/lib/obituaries/data";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://janczak-synowie.vercel.app")
  ).replace(/\/$/, "");
  const entries = await getSitemapObituaries();
  return [
    { url: `${base}/nekrologi`, changeFrequency: "weekly", priority: 0.7 },
    ...entries.map((item) => ({
      url: `${base}/nekrologi/${item.slug}`,
      lastModified: new Date(item.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
