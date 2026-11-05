import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { Building2, CheckCircle2, Shield, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Login Staf Sarpras",
  description: "Portal masuk staf pengelolaan sarana prasarana Universitas Negeri Surabaya (UNESA).",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background text-foreground">
      {/* Kolom Kiri: Form Login */}
      <div className="flex flex-col justify-between p-6 md:p-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Building2 className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight tracking-tight">SAFA UNESA</span>
              <span className="text-[10px] text-muted-foreground font-normal">Campus Facility Reporting</span>
            </div>
          </Link>

          <Link
            href="/docs"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Dokumentasi Sistem
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-sm">
            <Suspense fallback={<div className="text-center text-sm text-muted-foreground">Memuat formulir login...</div>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          &copy; 2026 Universitas Negeri Surabaya. Hak Cipta Dilindungi.
        </div>
      </div>

      {/* Kolom Kanan: Visual Branding SAFA */}
      <div className="relative hidden bg-muted/40 border-l border-border lg:flex flex-col justify-between p-12 text-foreground">
        <div className="space-y-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            Layanan Pengaduan Sarpras
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Transparansi Fasilitas Kampus Masa Depan
          </h2>
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
            Laporkan kendala fasilitas di Kampus Ketintang maupun Kampus Lidah Wetan secara cepat dan pantau langsung proses perbaikan teknisi.
          </p>
        </div>

        <div className="space-y-4 my-auto py-8">
          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-card border border-border text-card-foreground shadow-xs">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-semibold text-sm">Verifikasi Cepat & Akurat</h4>
              <p className="text-xs text-muted-foreground">
                Laporan diverifikasi langsung oleh tim sarana dan prasarana fakultas bersangkutan.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-card border border-border text-card-foreground shadow-xs">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <Wrench className="size-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-semibold text-sm">Penanganan Terjadwal</h4>
              <p className="text-xs text-muted-foreground">
                Pekerjaan teknisi tercatat dalam riwayat audit trail yang dapat dipantau pelapor.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-card border border-border text-card-foreground shadow-xs">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <Shield className="size-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-semibold text-sm">Akun Terintegrasi UNESA</h4>
              <p className="text-xs text-muted-foreground">
                Akses aman menggunakan kredensial resmi civitas akademika UNESA.
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground flex items-center justify-between border-t border-border pt-4">
          <span>SAFA (uneSA FAcility)</span>
          <span>Versi 1.0</span>
        </div>
      </div>
    </div>
  );
}
