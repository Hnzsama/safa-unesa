import type { Metadata } from "next";
import { Users, CheckCircle2, Clock, Wrench, XCircle, FileText, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Panduan Pengguna (SOP)",
  description:
    "Petunjuk operasional sistem pelaporan sarana prasarana kampus UNESA bagi mahasiswa, dosen, serta tim pengelola sarpras.",
  alternates: {
    canonical: "/docs/user",
  },
};

export default function UserDocsPage() {
  return (
    <div className="space-y-8 sm:space-y-12 w-full min-w-0">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Users className="w-4 h-4 shrink-0" />
          <span>User Manual & Guide</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground break-words">
          Panduan Pengguna SAFA
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
          Petunjuk operasional praktis sistem pelaporan fasilitas kampus UNESA bagi Mahasiswa, Dosen, serta Tim Pengelola Fasilitas (Sarpras).
        </p>
      </div>

      {/* Bagian 1: Panduan Pelapor (Mahasiswa & Dosen) */}
      <section className="space-y-4 sm:space-y-6">
        <div className="border-b border-border pb-3">
          <div className="flex items-start gap-3">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs sm:text-sm font-bold shrink-0 mt-0.5">
              1
            </span>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground break-words">
                Panduan Mahasiswa & Dosen (Pelapor)
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Langkah-langkah menyampaikan keluhan kerusakan fasilitas kampus UNESA.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-xl border border-border bg-card text-card-foreground space-y-2.5 shadow-xs">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
              01
            </div>
            <h3 className="font-semibold text-foreground text-sm sm:text-base">
              Pilih Lokasi & Kategori
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tentukan kampus (Ketintang / Lidah Wetan), nama gedung, lantai, dan ruangan spesifik. Pilih kategori fasilitas yang bermasalah (misal: AC, Proyektor, Sanitasi).
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-xl border border-border bg-card text-card-foreground space-y-2.5 shadow-xs">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
              02
            </div>
            <h3 className="font-semibold text-foreground text-sm sm:text-base">
              Unggah Bukti Fisik
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sertakan foto bukti fisik yang jelas dan fokus pada bagian yang rusak. Format yang didukung: JPG, PNG, atau WebP (maksimal ukuran 5MB per file).
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-xl border border-border bg-card text-card-foreground space-y-2.5 shadow-xs sm:col-span-2 lg:col-span-1">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
              03
            </div>
            <h3 className="font-semibold text-foreground text-sm sm:text-base">
              Pantau Timeline Status
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Setelah dikirim, pantau perkembangan verifikasi dan pengerjaan teknisi secara transparan melalui menu <strong>Riwayat Laporan</strong>.
            </p>
          </div>
        </div>

        {/* Status Glossary */}
        <div className="p-4 sm:p-6 rounded-xl border border-border bg-card text-card-foreground space-y-3 sm:space-y-4 shadow-xs">
          <h3 className="text-sm sm:text-base font-bold text-foreground">
            Memahami Arti Status Laporan Anda
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3 text-xs">
            <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                Submitted
              </span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Laporan berhasil masuk ke sistem dan menunggu giliran diverifikasi staf sarpras.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 space-y-1">
              <span className="font-semibold text-primary flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                Verified
              </span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Laporan valid dan telah disetujui staf untuk dijadwalkan pengerjaan teknisi.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 space-y-1">
              <span className="font-semibold text-destructive flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                Rejected
              </span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Laporan ditolak. Alasan penolakan wajib tertulis di detail laporan.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-accent border border-border space-y-1">
              <span className="font-semibold text-accent-foreground flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 shrink-0" />
                In Progress
              </span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Teknisi fasilitas sedang melakukan inspeksi atau perbaikan fisik di lokasi.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-muted border border-border space-y-1 sm:col-span-2 lg:col-span-1">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                Resolved
              </span>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Fasilitas telah selesai diperbaiki dan siap digunakan normal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bagian 2: Panduan Staf Sarpras (Facility Staff) */}
      <section className="space-y-4 sm:space-y-6">
        <div className="border-b border-border pb-3">
          <div className="flex items-start gap-3">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs sm:text-sm font-bold shrink-0 mt-0.5">
              2
            </span>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground break-words">
                Panduan Staf Sarana & Prasarana (Facility Staff)
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Standar operasional pengelolaan, verifikasi, dan penyelesaian laporan fasilitas.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="p-4 sm:p-5 rounded-xl border border-border bg-card text-card-foreground flex flex-col sm:flex-row gap-3 sm:gap-4 items-start shadow-xs">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 text-foreground">
              <FileText className="w-5 h-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <h3 className="font-bold text-foreground text-sm sm:text-base">
                1. Meninjau Antrean Laporan Masuk (Incoming Reports)
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Akses dashboard staf untuk melihat laporan yang baru disubmit. Tinjau kesesuaian lokasi gedung, kategori kerusakan, serta kejelasan foto lampiran yang disertakan oleh pelapor.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl border border-border bg-card text-card-foreground flex flex-col sm:flex-row gap-3 sm:gap-4 items-start shadow-xs">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 text-foreground">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1 min-w-0">
              <h3 className="font-bold text-foreground text-sm sm:text-base">
                2. Verifikasi Laporan: Approve atau Reject
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                - <strong>Approve (Valid):</strong> Jika laporan sesuai dan membutuhkan perbaikan, klik tombol <em>Verifikasi Laporan</em>. Status berubah menjadi <code className="text-xs px-1 py-0.5 rounded-sm bg-muted text-foreground">verified</code>.<br />
                - <strong>Reject (Ditolak):</strong> Jika laporan tidak valid, bukan aset kampus, atau duplikat, klik <em>Tolak Laporan</em> dan <u>wajib</u> menuliskan alasan penolakan secara jelas.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl border border-border bg-card text-card-foreground flex flex-col sm:flex-row gap-3 sm:gap-4 items-start shadow-xs">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 text-foreground">
              <Wrench className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1 min-w-0">
              <h3 className="font-bold text-foreground text-sm sm:text-base">
                3. Update Status Pengerjaan (In Progress $\to$ Resolved)
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Saat teknisi diterjunkan ke lokasi, perbarui status menjadi <code className="text-xs px-1 py-0.5 rounded-sm bg-muted text-foreground">in_progress</code>. Setelah perbaikan rampung diuji coba, ubah status menjadi <code className="text-xs px-1 py-0.5 rounded-sm bg-muted text-foreground">resolved</code>. Pelapor akan otomatis menerima notifikasi pada setiap perubahan.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
