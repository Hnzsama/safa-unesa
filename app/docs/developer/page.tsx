import type { Metadata } from "next";
import { Code2, Database, Shield, Cpu, Key, FileCode2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Dokumentasi Developer & Arsitektur",
  description:
    "Spesifikasi teknis Next.js 16, arsitektur NextAuth + Supabase PostgreSQL, automasi triggers, skema relasional, dan integrasi API.",
  alternates: {
    canonical: "/docs/developer",
  },
};

export default function DeveloperDocsPage() {
  return (
    <div className="space-y-8 sm:space-y-12 w-full min-w-0">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Code2 className="w-4 h-4 shrink-0" />
          <span>Technical Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground break-words">
          Dokumentasi Developer SAFA
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
          Spesifikasi arsitektur teknis, integrasi NextAuth dengan Supabase PostgreSQL, automasi triggers, skema relasional, dan panduan lingkungan pengembangan.
        </p>
      </div>

      {/* 1. Tech Stack Overview */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primary shrink-0" />
          <span>1. Arsitektur & Tech Stack</span>
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-card text-card-foreground shadow-xs">
          <table className="w-full min-w-[520px] text-xs sm:text-sm divide-y divide-border">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-left font-semibold">Komponen</th>
                <th className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-left font-semibold">Teknologi</th>
                <th className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-left font-semibold">Tanggung Jawab</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              <tr>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 font-medium">Framework</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3">Next.js 16 (App Router)</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-muted-foreground">Server Components, Actions, API Routes</td>
              </tr>
              <tr>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 font-medium">Database & Storage</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3">Supabase (PostgreSQL 15+)</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-muted-foreground">Relational DB, File Storage, Triggers</td>
              </tr>
              <tr>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 font-medium">Authentication</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3">NextAuth.js (PG Adapter)</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-muted-foreground">OAuth & Credentials session management</td>
              </tr>
              <tr>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 font-medium">Styling & UI</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3">shadcn/ui + Tailwind CSS</td>
                <td className="px-3.5 py-2.5 sm:px-4 sm:py-3 text-muted-foreground">Design system, accessible UI primitives</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. NextAuth Database Schema & Extensions */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary shrink-0" />
          <span>2. Skema Autentikasi NextAuth & Custom Users</span>
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          NextAuth PostgreSQL Adapter menggunakan tabel standar (<code className="text-xs px-1 py-0.5 rounded-sm bg-muted text-foreground">users</code>, <code className="text-xs px-1 py-0.5 rounded-sm bg-muted text-foreground">accounts</code>, <code className="text-xs px-1 py-0.5 rounded-sm bg-muted text-foreground">sessions</code>, <code className="text-xs px-1 py-0.5 rounded-sm bg-muted text-foreground">verification_tokens</code>). Pada sistem SAFA, tabel <code className="text-xs px-1 py-0.5 rounded-sm bg-muted text-foreground">users</code> diperluas dengan kolom kustom:
        </p>

        <div className="bg-muted border border-border text-foreground p-3.5 sm:p-4 rounded-xl font-mono text-[11px] sm:text-xs overflow-x-auto max-w-full">
{`-- Kolom Kustom pada tabel users:
ALTER TABLE users ADD COLUMN role user_role NOT NULL DEFAULT 'student';
ALTER TABLE users ADD COLUMN identity_number VARCHAR(50); -- NIM Mahasiswa / NIP Dosen & Staf
ALTER TABLE users ADD COLUMN phone_number VARCHAR(25);
ALTER TABLE users ADD COLUMN password TEXT; -- Kata sandi ter-enkripsi bcrypt
ALTER TABLE users ADD COLUMN created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());`}
        </div>
      </section>

      {/* 3. Domain Model SAFA */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
          <Database className="w-5 h-5 text-primary shrink-0" />
          <span>3. Struktur Tabel Domain & Relasi</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
          <div className="p-3.5 sm:p-4 rounded-xl border border-border bg-card text-card-foreground space-y-1.5 shadow-xs">
            <span className="font-bold text-primary text-sm">locations</span>
            <p className="text-muted-foreground">Master data gedung & area kampus.</p>
            <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
              <li><code>campus_name</code>: Ketintang / Lidah Wetan</li>
              <li><code>building_name</code>: Gedung Rektorat, FT E1, dll.</li>
              <li><code>floor</code> & <code>room_or_area</code></li>
            </ul>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl border border-border bg-card text-card-foreground space-y-1.5 shadow-xs">
            <span className="font-bold text-primary text-sm">facility_categories</span>
            <p className="text-muted-foreground">Taksonomi klasifikasi kerusakan sarpras.</p>
            <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
              <li><code>name</code>: Kelistrikan, Sanitasi, dll.</li>
              <li><code>description</code>: Penjelasan detail</li>
              <li><code>is_active</code>: Flag status aktif</li>
            </ul>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl border border-border bg-card text-card-foreground space-y-1.5 shadow-xs">
            <span className="font-bold text-primary text-sm">reports</span>
            <p className="text-muted-foreground">Entitas laporan utama yang diajukan civitas.</p>
            <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
              <li>Relasi FK: <code>reporter_id</code>, <code>location_id</code>, <code>category_id</code></li>
              <li><code>current_status</code>: enum status</li>
              <li><code>rejection_reason</code>: Alasan jika status rejected</li>
            </ul>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl border border-border bg-card text-card-foreground space-y-1.5 shadow-xs">
            <span className="font-bold text-primary text-sm">status_logs & notifications</span>
            <p className="text-muted-foreground">Audit trail timeline dan in-app notification.</p>
            <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
              <li>Otomatis diisi melalui Database Trigger</li>
              <li>Mencatat previous $\to$ new status & timestamp</li>
              <li>Notifikasi ke staf (saat submit) & pelapor (saat update)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Triggers & Automation */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
          <FileCode2 className="w-5 h-5 text-primary shrink-0" />
          <span>4. Database Triggers & Automasi</span>
        </h2>
        <div className="space-y-3 text-xs sm:text-sm text-muted-foreground">
          <div className="p-3.5 sm:p-4 rounded-xl border border-border bg-card text-card-foreground space-y-1.5 shadow-xs">
            <h3 className="font-bold text-foreground text-xs sm:text-sm">
              a. Auto-Log Audit Trail (<code className="text-[11px] sm:text-xs">trg_reports_status_audit_trail</code>)
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Mendeteksi operasi <code>INSERT</code> atau <code>UPDATE OF current_status</code> pada tabel <code>reports</code>, lalu otomatis menyisipkan rekaman ke tabel <code>report_status_logs</code> lengkap dengan deskripsi status dan pelaku perubahan.
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl border border-border bg-card text-card-foreground space-y-1.5 shadow-xs">
            <h3 className="font-bold text-foreground text-xs sm:text-sm">
              b. Event-Driven Notifications (<code className="text-[11px] sm:text-xs">trg_reports_notification_dispatch</code>)
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Mengirim notifikasi instan ke seluruh <code>facility_staff</code> ketika ada laporan berstatus <code>submitted</code> baru masuk. Sebaliknya, saat status diubah menjadi <code>verified</code>, <code>rejected</code>, <code>in_progress</code>, atau <code>resolved</code>, notifikasi otomatis disalurkan ke <code>reporter_id</code>.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Environment Variables Guide */}
      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
          <Key className="w-5 h-5 text-primary shrink-0" />
          <span>5. Konfigurasi Lingkungan (.env.local)</span>
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Variabel yang diperlukan untuk menjalankan sistem secara lokal maupun di lingkungan staging:
        </p>
        <div className="bg-muted border border-border text-foreground p-3.5 sm:p-4 rounded-xl font-mono text-[11px] sm:text-xs overflow-x-auto space-y-1 max-w-full">
          <p className="text-muted-foreground"># NextAuth Configuration</p>
          <p>NEXTAUTH_URL=http://localhost:3000</p>
          <p>NEXTAUTH_SECRET=your_nextauth_super_secret_key_min_32_characters</p>
          <p className="text-muted-foreground pt-2"># Supabase Client API & Storage</p>
          <p>NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co</p>
          <p>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key</p>
        </div>
      </section>
    </div>
  );
}
