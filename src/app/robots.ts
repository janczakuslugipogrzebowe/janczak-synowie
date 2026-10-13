import type { MetadataRoute } from "next";

// Tymczasowa wersja dla właściciela — nie indeksujemy przed uruchomieniem SEO.
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", disallow: "/" }] };
}
