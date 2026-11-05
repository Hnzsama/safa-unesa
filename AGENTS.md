<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

## SAFA Admin Dashboard Design Rules (Mandatory)

Seluruh modul pengelolaan, halaman staf fasilitas sarpras (`facility_staff`), dan admin sistem **WAJIB** menggunakan acuan desain pada folder `app/dashboard/`:
- **Shell & Layout:** Wajib menggunakan `<SidebarProvider>`, `<AppSidebar variant="inset" />`, `<SidebarInset>`, dan `<SiteHeader />`. Dilarang membuat sidebar custom terpisah.
- **Tabel Data:** Wajib mereplikasi pola [components/data-table.tsx](file:///home/Akuma/projects/safa/components/data-table.tsx) (`@tanstack/react-table`, toolbar pencarian, filter kolom, drawer detail responsif via `@/components/ui/drawer`).
- **Kartu Metrik & Statistik:** Wajib mereplikasi pola [components/section-cards.tsx](file:///home/Akuma/projects/safa/components/section-cards.tsx) (`Card`, trend icons, indicator percentages).
- **Grafik Analitik:** Wajib mereplikasi pola [components/chart-area-interactive.tsx](file:///home/Akuma/projects/safa/components/chart-area-interactive.tsx) (`@/components/ui/chart` + Recharts).
- **Feedback & Notifikasi:** Wajib menggunakan `sonner` (`toast`).

Aturan lengkap dapat dibaca pada [.agents/rules/admin-dashboard-design-system.md](file:///home/Akuma/projects/safa/.agents/rules/admin-dashboard-design-system.md).
