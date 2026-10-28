import type { MetadataRoute } from "next";

// The site stays unindexed before launch. Only Meta's link-preview bots may
// fetch public obituary pages and their generated Open Graph images.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: ["facebookexternalhit", "meta-externalagent", "meta-externalfetcher"],
        allow: "/nekrologi/",
        disallow: ["/admin/", "/api/admin/"],
      },
      { userAgent: "*", disallow: "/" },
    ],
  };
}
