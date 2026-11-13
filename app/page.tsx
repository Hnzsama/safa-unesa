import Link from "next/link";
import {
  Building2,
  Sparkles,
  UserCheck,
  Wrench,
  Search,
  PenLine,
  Zap,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Camera,
  ArrowRight,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicReportForm } from "@/components/reports/public-report-form";
import { PublicReportTracker } from "@/components/reports/public-report-tracker";
import { getMasterData } from "@/lib/actions/reports";

export const instant = false;

const faqs = [
  {
    question: "Apakah mahasiswa atau dosen wajib login akun SSO untuk melapor?",
    answer:
      "Tidak wajib. SAFA mengusung prinsip pelaporan tanpa hambatan (frictionless). Anda cukup memasukkan Nama Lengkap dan NIM (Mahasiswa) atau NIP (Dosen), lalu memilih lokasi fasilitas dan melampirkan foto bukti kondisi fisik.",
  },
  {
    question: "Bagaimana cara melacak progres penanganan tiket perbaikan saya?",
    answer:
      "Buka tab 'Lacak Tiket' pada halaman utama ini, lalu ketikkan NIM atau NIP Anda untuk melihat semua tiket yang pernah diajukan. Anda juga bisa langsung membuka tautan tiket spesifik untuk melihat riwayat audit trail lengkap.",
  },
  {
    question: "Berapa lama estimasi waktu penanganan sarana prasarana?",
    answer:
      "Triase dan validasi oleh tim staf sarpras berlangsung maksimal 1x24 jam kerja. Setelah diverifikasi, teknisi dijadwalkan langsung ke lokasi dengan estimasi perbaikan 1-3 hari kerja tergantung ketersediaan suku cadang dan tingkat kerusakan fisik.",
  },
  {
    question: "Kampus dan fasilitas apa saja yang dapat dilaporkan melalui SAFA?",
    answer:
      "SAFA melayani seluruh sarana prasarana di Kampus Ketintang dan Kampus Lidah Wetan UNESA, meliputi pendingin ruangan (AC), proyektor kelas, kelistrikan & stopkontak, sanitasi & toilet, serta mebeler kursi/meja ruang perkuliahan.",
  },
  {
    question: "Apakah pelapor dapat melihat bukti foto bahwa fasilitas sudah selesai diperbaiki?",
    answer:
      "Ya. Setiap perbaikan yang berstatus tuntas wajib disertai unggahan foto bukti fisik hasil perbaikan oleh teknisi sarpras. Foto hasil penanganan dapat dilihat secara transparan dan berdampingan pada halaman detail tiket laporan.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default async function Home() {
  const { locations, categories } = await getMasterData();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between relative selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      {/* FAQ Structured Data for Google Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Ambient background decoration */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[90vw] max-w-[640px] h-[320px] bg-primary/10 blur-[100px] rounded-full" />
        <div className="absolute top-96 -left-20 w-64 h-64 bg-accent/40 blur-[90px] rounded-full" />
        <div className="absolute top-[600px] -right-20 w-64 h-64 bg-primary/5 blur-[90px] rounded-full" />
      </div>

      {/* Main Container - Mobile First without sticky navbar */}
      <main className="flex-1 max-w-3xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-10 w-full space-y-6 sm:space-y-8">
        {/* Top Minimal Brand Bar */}
        <header className="flex items-center justify-between gap-3 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 shrink-0">
              <Building2 className="size-4.5 sm:size-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="leading-tight tracking-tight font-black text-base sm:text-lg text-foreground">
                  SAFA UNESA
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                  PELAPORAN
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium">
                Layanan Pengaduan Sarpras UNESA
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              href="/resolved"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "h-8 px-2.5 text-xs font-semibold gap-1.5 rounded-xl border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10",
              })}
            >
              <CheckCircle2 className="size-3.5" />
              <span className="hidden sm:inline">Laporan Selesai</span>
              <span className="sm:hidden">Selesai</span>
            </Link>
            <Link
              href="/login"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground font-semibold gap-1 rounded-xl",
              })}
            >
              <UserCheck className="size-3.5 text-primary" />
              <span className="text-xs">Petugas</span>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section aria-label="Hero Pengaduan Fasilitas" className="text-center space-y-3.5 sm:space-y-4">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-muted/80 text-foreground border border-border shadow-xs backdrop-blur-sm">
            <span className="flex size-2 rounded-full bg-primary animate-pulse" />
            <span className="text-muted-foreground font-medium">Layanan Sarpras Terbuka</span>
            <span className="text-border">|</span>
            <span className="text-primary font-bold flex items-center gap-1">
              <Zap className="size-3" /> Gak Perlu Login
            </span>
          </div>

          {/* Punchy Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.2]">
            Fasilitas Rusak? <br />
            <span className="bg-gradient-to-r from-foreground via-primary to-muted-foreground bg-clip-text text-transparent">
              Spill Aja di Sini, Brok!
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed px-1">
            Ada AC netes, proyektor mati, toilet macet, atau kursi patah? Langsung lapor pakai NIM / NIP &amp; foto buktinya biar gercep diperbaiki tim sarpras.
          </p>

          {/* Quick Value Props (Mobile Optimized 2x2 Grid) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-left">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-card/70 border border-border/80 backdrop-blur-xs flex items-center gap-2 sm:gap-2.5 shadow-xs">
              <div className="size-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Zap className="size-3.5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[11px] text-foreground leading-tight">No Login</div>
                <div className="text-[10px] text-muted-foreground truncate">Nama &amp; NIM/NIP</div>
              </div>
            </div>

            <div className="p-2.5 sm:p-3 rounded-2xl bg-card/70 border border-border/80 backdrop-blur-xs flex items-center gap-2 sm:gap-2.5 shadow-xs">
              <div className="size-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Camera className="size-3.5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[11px] text-foreground leading-tight">Jepret Foto</div>
                <div className="text-[10px] text-muted-foreground truncate">Bisa dari HP</div>
              </div>
            </div>

            <div className="p-2.5 sm:p-3 rounded-2xl bg-card/70 border border-border/80 backdrop-blur-xs flex items-center gap-2 sm:gap-2.5 shadow-xs">
              <div className="size-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Clock className="size-3.5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[11px] text-foreground leading-tight">Live Tracking</div>
                <div className="text-[10px] text-muted-foreground truncate">Pantau progres</div>
              </div>
            </div>

            <div className="p-2.5 sm:p-3 rounded-2xl bg-card/70 border border-border/80 backdrop-blur-xs flex items-center gap-2 sm:gap-2.5 shadow-xs">
              <div className="size-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ShieldCheck className="size-3.5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-[11px] text-foreground leading-tight">2 Kampus</div>
                <div className="text-[10px] text-muted-foreground truncate">Ketintang & Liwet</div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Controls: Lapor vs Cek Status */}
        <section aria-label="Formulir Laporan dan Pelacakan Tiket">
          <Tabs defaultValue="report" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 sm:h-14 p-1 sm:p-1.5 bg-muted/70 backdrop-blur-md rounded-2xl border border-border shadow-xs">
              <TabsTrigger
                value="report"
                className="rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:scale-[0.99]"
              >
                <PenLine className="size-3.5 sm:size-4 text-primary" />
                <span>Form Lapor</span>
                <span className="text-[9px] sm:text-[10px] font-black uppercase px-1.5 py-0.2 rounded-full bg-primary/15 text-primary">
                  Cepat
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="track"
                className="rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:scale-[0.99]"
              >
                <Search className="size-3.5 sm:size-4 text-primary" />
                <span>Lacak Tiket</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Formulir Pengaduan */}
            <TabsContent value="report" className="mt-4 sm:mt-6">
              <Card className="border border-border/80 shadow-md bg-card/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl overflow-hidden">
                <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border/60 bg-muted/20">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base sm:text-lg font-black flex items-center gap-2 text-foreground">
                        <Wrench className="size-4.5 sm:size-5 text-primary" />
                        <span>Form Pengaduan Fasilitas</span>
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        Sampaikan kendala fasilitas dengan jelas biar teknisi sarpras bisa segera menindaklanjuti.
                      </CardDescription>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border shrink-0">
                      <Sparkles className="size-3 text-primary" />
                      <span>3 Langkah</span>
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-3.5 sm:p-6">
                  <PublicReportForm locations={locations} categories={categories} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Lacak Status */}
            <TabsContent value="track" className="mt-4 sm:mt-6">
              <Card className="border border-border/80 shadow-md bg-card/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl overflow-hidden">
                <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border/60 bg-muted/20">
                  <CardTitle className="text-base sm:text-lg font-black flex items-center gap-2 text-foreground">
                    <Search className="size-4.5 sm:size-5 text-primary" />
                    <span>Cek Status &amp; Linimasa Tiket</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Ketik NIM Anda atau masukkan Kode Tiket untuk melihat progres penanganan teknisi.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3.5 sm:p-6">
                  <PublicReportTracker />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* How It Works Banner */}
        <section aria-label="Alur Prosedur Penanganan Fasilitas" className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-card border border-border/80 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-xs sm:text-sm text-foreground flex items-center gap-2">
              <Sparkles className="size-3.5 sm:size-4 text-primary" />
              <span>Gimana Alur Penanganannya?</span>
            </h2>
            <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground">SOP Sarpras UNESA</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl sm:rounded-2xl bg-muted/40 border border-border/60 space-y-1">
              <div className="text-[9px] sm:text-[10px] font-mono font-bold text-primary">01 / LAPOR</div>
              <div className="font-bold text-xs text-foreground">Kirim Info &amp; Bukti</div>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug">
                Isi NIM, spot ruangan, &amp; foto kondisi fisik.
              </p>
            </div>

            <div className="p-3 rounded-xl sm:rounded-2xl bg-muted/40 border border-border/60 space-y-1">
              <div className="text-[9px] sm:text-[10px] font-mono font-bold text-primary">02 / VERIFIKASI</div>
              <div className="font-bold text-xs text-foreground">Cek Staf Sarpras</div>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug">
                Staf memvalidasi &amp; jadwalkan teknisi.
              </p>
            </div>

            <div className="p-3 rounded-xl sm:rounded-2xl bg-muted/40 border border-border/60 space-y-1">
              <div className="text-[9px] sm:text-[10px] font-mono font-bold text-primary">03 / TINDAK LANJUT</div>
              <div className="font-bold text-xs text-foreground">Teknisi OTW</div>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug">
                Perbaikan alat langsung di ruangan kampus.
              </p>
            </div>

            <div className="p-3 rounded-xl sm:rounded-2xl bg-muted/40 border border-border/60 space-y-1">
              <div className="text-[9px] sm:text-[10px] font-mono font-bold text-primary">04 / KELAR</div>
              <div className="font-bold text-xs text-foreground">Selesai &amp; Nyaman</div>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug">
                Ruangan kembali nyaman digunakan.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section (SEO Boost + Rich Snippets) */}
        <section aria-label="Pertanyaan yang Sering Diajukan" className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-xs sm:text-sm text-foreground flex items-center gap-2">
              <HelpCircle className="size-4 text-primary" />
              <span>Pertanyaan yang Sering Diajukan (FAQ)</span>
            </h2>
            <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground">Info &amp; Bantuan</span>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/30 hover:bg-muted/50 border border-border/60 transition-all cursor-pointer"
              >
                <summary className="flex items-center justify-between gap-3 font-semibold text-xs sm:text-sm text-foreground list-none select-none">
                  <span>{faq.question}</span>
                  <ChevronDown className="size-4 text-muted-foreground shrink-0 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed border-t border-border/30 pt-2.5">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* Modern Compact Footer */}
      <footer className="border-t border-border/70 py-6 bg-card/60 backdrop-blur-md text-xs text-muted-foreground mt-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">SAFA UNESA</span>
              <span className="text-muted-foreground font-normal text-[11px]">
                · Kampus Ketintang &amp; Lidah Wetan
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <Link href="/resolved" className="hover:underline text-emerald-600 dark:text-emerald-400 font-semibold">
                Laporan Selesai
              </Link>
              <Link href="/docs/user" className="hover:underline text-muted-foreground hover:text-foreground">
                Panduan SOP
              </Link>
              <Link href="/docs" className="hover:underline text-muted-foreground hover:text-foreground">
                Dokumentasi
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                <span>Login Staf</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>

          <div className="text-[10px] sm:text-[11px] text-muted-foreground/80 flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-border/40">
            <span>&copy; {new Date().getFullYear()} Biro Sarana &amp; Prasarana Universitas Negeri Surabaya</span>
            <div className="flex items-center gap-1.5 text-foreground font-medium">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistem Aktif &amp; Terbuka</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
