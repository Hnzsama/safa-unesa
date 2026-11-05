import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://safa.unesa.ac.id";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/docs", "/docs/*"],
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

