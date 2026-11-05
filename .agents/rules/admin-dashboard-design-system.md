---
description: "Aturan Desain & Standar Arsitektur Komponen Admin / Facility Staff Dashboard SAFA"
globs: ["app/dashboard/**", "app/staff/**", "app/admin/**", "components/data-table.tsx", "components/section-cards.tsx", "components/app-sidebar.tsx"]
alwaysApply: true
---

# ATURAN DESAIN & KOMPONEN ADMIN DASHBOARD SAFA

Dokumen ini adalah **aturan baku (design rule)** yang mewajibkan seluruh halaman pengelolaan, admin, dan staf sarpras (Facility Staff) mematuhi struktur dan komponen pada folder `app/dashboard/`.

---

## 1. Sumber Acuan Tunggal (Single Source of Truth)
Template dan arsitektur di `app/dashboard/` adalah referensi desain mutlak untuk:
- Dashboard Staf Fasilitas / Sarpras (`/staff/dashboard` atau `/dashboard`)
- Antrean Laporan Masuk (*Incoming Reports*)
- Verifikasi & Penanganan Laporan (*Approve / Reject / In Progress / Resolved*)
- Manajemen Master Data (Lokasi Gedung Kampus & Kategori Fasilitas)
- Manajemen Pengguna & Audit Log

---

## 2. Aturan Struktur Layout & Shell (Wajib)
Setiap halaman admin/staf **WAJIB** menggunakan wrapper dan hierarki yang sama persis dengan `app/dashboard/page.tsx`:

```tsx
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"

export default function AdminPage() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Konten Halaman: Cards, Charts, DataTable */}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

> **Larangan Keras:**
> - JANGAN membuat sidebar custom atau layout pembungkus alternatif di luar `@/components/ui/sidebar` dan `@/components/app-sidebar`.
> - JANGAN menghilangkan `SidebarInset` atau `SiteHeader` pada halaman back-office/staf.

---

## 3. Standar Tabel Data (Data Table Rules)
Semua tabel data pada modul admin/staf **WAJIB** mengikuti pola implementasi pada [components/data-table.tsx](file:///home/Akuma/projects/safa/components/data-table.tsx):
1. **Engine Tabel:** Menggunakan `@tanstack/react-table` (v8) + `@/components/ui/table`.
2. **Toolbar & Fitur Wajib:**
   - Pencarian real-time via `@/components/ui/input`.
   - Filter kolom & toggle visibilitas kolom via `@/components/ui/dropdown-menu`.
   - Seleksi baris (*multi-row selection*) menggunakan `@/components/ui/checkbox`.
   - Paginasi data yang responsif.
3. **Detail Drawer:** Setiap baris tabel yang dapat diinspeksi wajib menggunakan pola `@/components/ui/drawer` (seperti pada `data-table.tsx`) untuk menampilkan detail laporan, foto bukti, atau riwayat audit trail secara responsif.
4. **Status & Role Badges:** Menggunakan `@/components/ui/badge` dengan varian warna konsisten sesuai enum status SAFA:
   - `submitted`: Neutral / Outline
   - `verified`: Blue
   - `rejected`: Destructive (Rose/Red)
   - `in_progress`: Amber / Warning
   - `resolved`: Emerald / Success

---

## 4. Standar Kartu Metrik (Metric Cards)
Komponen ringkasan statistik (misal: Total Laporan, Butuh Verifikasi, Sedang Ditangani, Selesai) **WAJIB** mengacu pada pola [components/section-cards.tsx](file:///home/Akuma/projects/safa/components/section-cards.tsx):
- Menggunakan `@/components/ui/card` (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`).
- Menampilkan persentase tren dengan ikon tren (`TrendingUpIcon` / `TrendingDownIcon`).
- Menggunakan tipografi `text-2xl font-bold` untuk angka metrik utama.

---

## 5. Standar Grafik & Visualisasi
Setiap visualisasi data analitik kerusakan sarpras **WAJIB** mengikuti pola [components/chart-area-interactive.tsx](file:///home/Akuma/projects/safa/components/chart-area-interactive.tsx):
- Menggunakan `@/components/ui/chart` (`ChartContainer`, `ChartTooltip`, `ChartTooltipContent`).
- Menggunakan Recharts (`AreaChart`, `BarChart`, `CartesianGrid`, `XAxis`).
- Menggunakan hook `useIsMobile()` dari `@/hooks/use-mobile` untuk responsivitas rentang waktu otomatis.

---

## 6. Standar Notifikasi & Dialog Konfirmasi
- Notifikasi aksi (misal: "Laporan berhasil diverifikasi", "Status diubah") **WAJIB** menggunakan `sonner` (`toast.success()`, `toast.error()`).
- Dialog aksi penting (Verifikasi Approve / Form Alasan Reject) menggunakan `@/components/ui/drawer` untuk mobile atau `@/components/ui/dialog` untuk desktop.

---

## 7. Standar Pewarnaan (Semantic CSS Variables Only - MANDATORY)
Seluruh styling warna di seluruh komponen dan halaman **WAJIB** menggunakan variabel CSS semantik yang didefinisikan pada `app/globals.css`. **DILARANG** meng-hardcode warna utility Tailwind (seperti `bg-blue-600`, `text-emerald-500`, `bg-neutral-900`, dll.):
- **Background:** `bg-background`, `bg-card`, `bg-muted`, `bg-accent`, `bg-popover`
- **Teks:** `text-foreground`, `text-muted-foreground`, `text-primary`, `text-card-foreground`
- **Aksi / Brand Primer:** `bg-primary`, `text-primary-foreground`, `bg-primary/10`, `text-primary`, `border-primary/20`
- **Feedback & Error:** `bg-destructive`, `text-destructive`, `bg-destructive/10`, `border-destructive/20`
- **Border & Input:** `border-border`, `border-input`, `ring-ring`

Dengan mematuhi variabel semantik ini, seluruh tema (Light/Dark mode atau perubahan palet warna aplikasi) dapat diubah dengan mudah hanya dari `:root` dan `.dark` di `globals.css`.

