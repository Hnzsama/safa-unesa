import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SAFA UNESA - Sistem Aspirasi & Fasilitas UNESA",
    short_name: "SAFA UNESA",
    description: "Layanan resmi pelaporan kerusakan fasilitas kampus Universitas Negeri Surabaya (UNESA).",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}

