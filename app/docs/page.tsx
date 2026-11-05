import type { Metadata } from "next";
import Link from "next/link";
import { Code2, Users, ArrowRight, CheckCircle2, Shield, Bell, HardDrive, GitBranch } from "lucide-react";

export const metadata: Metadata = {
  title: "Pusat Dokumentasi Sistem",
  description:
    "Dokumentasi resmi SAFA UNESA: Panduan pengguna bagi mahasiswa dan dosen, serta spesifikasi arsitektur teknis bagi pengembang.",
  alternates: {
    canonical: "/docs",
  },
};

export default function DocsOverviewPage() {
  return (
    <div className="space-y-8 sm:space-y-10 w-full min-w-0">
      {/* Hero Header */}
      <div className="p-5 sm:p-8 rounded-2xl border border-border bg-card text-card-foreground shadow-xs relative overflow-hidden">
        <div className="max-w-2xl">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-2 sm:mb-3">
            Sistem Informasi Pelaporan Fasilitas Kampus
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground break-words">
            Pusat Dokumentasi SAFA
          </h1>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
            Selamat datang di pusat dokumentasi <strong>SAFA (uneSA FAcility)</strong>. Sistem ini dirancang untuk memfasilitasi pelaporan kerusakan dan perawatan fasilitas di lingkungan Universitas Negeri Surabaya (UNESA) secara transparan, akuntabel, dan terintegrasi.
          </p>
        </div>
      </div>

      {/* Two Pillars Section: Developer vs User */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Card Developer Docs */}
        <div className="p-5 sm:p-6 rounded-xl border border-border bg-card text-card-foreground hover:border-primary/50 transition-all flex flex-col justify-between group space-y-4">
          <div className="space-y-3 sm:space-y-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Code2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                Dokumentasi Developer
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Spesifikasi teknis, arsitektur NextAuth + Supabase PostgreSQL, trigger otomatis, skema migrasi per tabel, dan API endpoints.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>NextAuth PG Adapter & User Extensions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Database Triggers (Audit Trail & Auto Notifications)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Supabase Storage Bucket & RLS Policies</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 mt-2 sm:mt-4 border-t border-border">
            <Link
              href="/docs/developer"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:underline group-hover:translate-x-0.5 transition-transform"
            >
              <span>Buka Dokumentasi Developer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Card User Docs */}
        <div className="p-5 sm:p-6 rounded-xl border border-border bg-card text-card-foreground hover:border-primary/50 transition-all flex flex-col justify-between group space-y-4">
          <div className="space-y-3 sm:space-y-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                Panduan Pengguna (User Guide)
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Panduan operasional praktis untuk Mahasiswa & Dosen (Pelapor) serta Staf Sarpras (Pengelola Verifikasi dan Perbaikan).
              </p>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Cara membuat laporan fasilitas dengan bukti foto</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Memahami alur status: Submitted $\to$ Verified $\to$ Resolved</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>SOP Staf Sarpras untuk verifikasi dan update perbaikan</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 mt-2 sm:mt-4 border-t border-border">
            <Link
              href="/docs/user"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:underline group-hover:translate-x-0.5 transition-transform"
            >
              <span>Buka Panduan Pengguna</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Core Architectural Highlights */}
      <div className="p-5 sm:p-6 rounded-xl border border-border bg-card text-card-foreground space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-foreground">
          Fitur Utama Sistem SAFA
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
          <div className="p-3.5 sm:p-4 rounded-lg bg-muted/50 border border-border space-y-1.5">
            <Shield className="w-5 h-5 text-primary shrink-0" />
            <h4 className="font-semibold text-foreground text-xs sm:text-sm">Role-Based Access</h4>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
              Isolasi akses antara Pelapor (Mahasiswa & Dosen) dan Pengelola (Facility Staff).
            </p>
          </div>
          <div className="p-3.5 sm:p-4 rounded-lg bg-muted/50 border border-border space-y-1.5">
            <GitBranch className="w-5 h-5 text-primary shrink-0" />
            <h4 className="font-semibold text-foreground text-xs sm:text-sm">Audit Trail Otomatis</h4>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
              Setiap transisi status laporan tercatat permanen di basis data dengan catatan waktu akurat.
            </p>
          </div>
          <div className="p-3.5 sm:p-4 rounded-lg bg-muted/50 border border-border space-y-1.5">
            <HardDrive className="w-5 h-5 text-primary shrink-0" />
            <h4 className="font-semibold text-foreground text-xs sm:text-sm">Penyimpanan Aman</h4>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
              Foto lampiran diunggah langsung ke Supabase Storage bucket dengan batasan tipe dan ukuran file.
            </p>
          </div>
          <div className="p-3.5 sm:p-4 rounded-lg bg-muted/50 border border-border space-y-1.5">
            <Bell className="w-5 h-5 text-primary shrink-0" />
            <h4 className="font-semibold text-foreground text-xs sm:text-sm">Notifikasi Realtime</h4>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
              Staf menerima kabar laporan baru, pelapor menerima pembaruan setiap status berubah.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
