
export { cn } from "cn";

/**
 * Mengubah UUID laporan menjadi kode tiket resmi yang estetik dan mudah diingat
 * Contoh: 60e3a80b-29d0-4aa0-ad9d-dd054f17c592 -> SAFA-60E3A80B
 */
export function formatTicketCode(id?: string | null): string {
  if (!id) return "SAFA-00000000";
  const hex = id.replace(/^SAFA-/i, "").replace(/-/g, "").slice(0, 8).toUpperCase();
  return `SAFA-${hex}`;
}
