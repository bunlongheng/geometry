import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://geometry-bheng.vercel.app";
  return [
    { url: base, priority: 1 },
    { url: `${base}/study`, priority: 0.9 },
    { url: `${base}/quiz`, priority: 0.9 },
  ];
}
