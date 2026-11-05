import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://safa.unesa.ac.id";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(appBaseUrl),
  title: {
    default: "SAFA UNESA - Sistem Aspirasi & Fasilitas UNESA",
    template: "%s | SAFA UNESA",
  },
  description:
    "Layanan resmi pelaporan kerusakan fasilitas kampus Universitas Negeri Surabaya (UNESA). Lapor cepat tanpa login untuk mahasiswa dan dosen di Kampus Ketintang & Kampus Lidah Wetan.",
  keywords: [
    "SAFA UNESA",
    "Sarpras UNESA",
    "Lapor Fasilitas UNESA",
    "Pengaduan Kampus UNESA",
    "Universitas Negeri Surabaya",
    "Fasilitas Kampus Ketintang",
    "Fasilitas Kampus Lidah Wetan",
    "Sistem Sarana Prasarana UNESA",
    "Perbaikan Ruang Kuliah UNESA",
  ],
  authors: [
    {
      name: "Subdirektorat Sarana & Prasarana UNESA",
      url: "https://unesa.ac.id",
    },
  ],
  creator: "Universitas Negeri Surabaya",
  publisher: "Universitas Negeri Surabaya",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SAFA UNESA - Portal Pengaduan Fasilitas Kampus Terpadu",
    description:
      "Layanan pelaporan sarana prasarana kampus UNESA secara cepat, transparan, dan realtime. Pantau progres perbaikan oleh teknisi sarpras langsung dari gawai Anda.",
    url: appBaseUrl,
    siteName: "SAFA UNESA",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SAFA UNESA - Portal Pengaduan Fasilitas Kampus",
    description:
      "Lapor kendala fasilitas sarpras kampus UNESA secara cepat tanpa perlu login. Pantau progres perbaikan realtime.",
    creator: "@official_unesa",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "Pendidikan & Layanan Publik",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollegeOrUniversity",
      "@id": `${appBaseUrl}/#organization`,
      name: "Universitas Negeri Surabaya",
      alternateName: "UNESA",
      url: "https://unesa.ac.id",
      logo: "https://unesa.ac.id/images/logo-unesa.png",
      sameAs: [
        "https://twitter.com/official_unesa",
        "https://www.instagram.com/official_unesa/",
        "https://www.facebook.com/official.unesa",
      ],
    },
    {
      "@type": "WebApplication",
      "@id": `${appBaseUrl}/#webapp`,
      name: "SAFA UNESA",
      alternateName: "uneSA FAcility Reporting System",
      applicationCategory: "PublicServicesApplication",
      operatingSystem: "All",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      url: appBaseUrl,
      description:
        "Sistem Informasi Aspirasi dan Pelaporan Fasilitas Kampus Universitas Negeri Surabaya secara cepat, transparan, dan realtime tanpa login.",
      provider: {
        "@id": `${appBaseUrl}/#organization`,
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "IDR",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
