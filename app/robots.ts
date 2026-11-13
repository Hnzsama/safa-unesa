import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://safa-unesa.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/resolved", "/docs", "/docs/*"],
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/api/*",
          "/profile",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

