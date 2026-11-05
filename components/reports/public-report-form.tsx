"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Camera,
  Copy,
  Check,
  Loader2,
  Send,
  ExternalLink,
  MapPin,
  Building2,
  Landmark,
  UploadCloud,
  X,
  Info,
  GraduationCap,
  Layers,
  Plus,
  ReceiptText,
  Clock,
  Ticket,
} from "lucide-react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { submitPublicReport, LocationItem, CategoryItem } from "@/lib/actions/reports";
import { convertToWebP } from "@/lib/utils/image-compression";
import { formatTicketCode } from "@/lib/utils";

export function detectFaculty(buildingName: string): string {
  const b = buildingName.toLowerCase();
  if (b.includes("teknik") || b.includes("(ft)") || b.startsWith("gedung e") || b.startsWith("gedung a")) {
    return "Fakultas Teknik (FT)";
  }
  if (b.includes("fmipa") || b.startsWith("gedung c")) {
    return "Fakultas Matematika & IPA (FMIPA)";
  }
  if (b.includes("feb") || b.includes("ekonomi") || b.startsWith("gedung g")) {
    return "Fakultas Ekonomika & Bisnis (FEB)";
  }
  if (b.includes("fish") || b.includes("sosial") || b.includes("hukum") || b.startsWith("gedung i")) {
    return "Fakultas Ilmu Sosial & Hukum (FISH)";
  }
  if (b.includes("vokasi") || b.startsWith("gedung k4")) {
    return "Fakultas Vokasi";
  }
  if (b.includes("fip") || b.includes("pendidikan") || b.startsWith("gedung o")) {
    return "Fakultas Ilmu Pendidikan (FIP)";
  }
  if (b.includes("fbs") || b.includes("bahasa") || b.includes("seni") || b.startsWith("gedung t")) {
    return "Fakultas Bahasa & Seni (FBS)";
  }
  if (b.includes("fio") || b.includes("fikk") || b.includes("olahraga") || b.includes("kolam") || b.includes("lapangan")) {
    return "Fakultas Ilmu Keolahragaan & Kesehatan (FIKK)";
  }
  if (b.includes("psikologi")) {
    return "Fakultas Psikologi (FPsi)";
  }
  if (b.includes("kedokteran") || b.includes("fk")) {
    return "Fakultas Kedokteran (FK)";
  }
  return "Fasilitas Umum & Rektorat";
}

interface UploadedImageItem {
  id: string;
  file: File;
  previewUrl: string;
  origSizeKb: number;
  compSizeKb: number;
}

const MAX_IMAGES = 5;

export function PublicReportForm({
  locations,
  categories,
  defaultUser,
}: {
  locations: LocationItem[];
  categories: CategoryItem[];
  defaultUser?: {
    name?: string;
    identityNumber?: string;
    phone?: string;
    role?: string;
  };
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [campusFilter, setCampusFilter] = useState<string>("Semua");
  const [selectedFaculty, setSelectedFaculty] = useState<string>("Semua");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [images, setImages] = useState<UploadedImageItem[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  // Success modal receipt state
  const [successReport, setSuccessReport] = useState<{
    reportId: string;
    nim: string;
    name: string;
    title: string;
    campusName: string;
    facultyName: string;
    locationName: string;
    categoryName: string;
    photosCount: number;
    submittedAt: string;
  } | null>(null);

  const [hasCopied, setHasCopied] = useState(false);

  // List of available faculties based on campus filter
  const availableFaculties = useMemo(() => {
    const set = new Set<string>();
    const baseList =
      campusFilter === "Semua"
        ? locations
        : locations.filter((loc) =>
            loc.campus_name.toLowerCase().includes(campusFilter.toLowerCase())
          );

    for (const loc of baseList) {
      set.add(detectFaculty(loc.building_name));
    }
    return Array.from(set).sort();
  }, [locations, campusFilter]);

  // Filter locations based on selected campus chip and faculty
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesCampus =
        campusFilter === "Semua" ||
        loc.campus_name.toLowerCase().includes(campusFilter.toLowerCase());
      const matchesFaculty =
        selectedFaculty === "Semua" ||
        detectFaculty(loc.building_name) === selectedFaculty;
      return matchesCampus && matchesFaculty;
    });
  }, [locations, campusFilter, selectedFaculty]);

  // Combobox options
  const facultyOptions = useMemo<ComboboxOption[]>(() => {
    const list: ComboboxOption[] = [
      {
        value: "Semua",
        label: "Semua Fakultas & Fasilitas Umum",
        description: "Tampilkan seluruh gedung dan unit kampus",
      },
    ];
    for (const fac of availableFaculties) {
      list.push({
        value: fac,
        label: fac,
        description: `Spot di ${campusFilter === "Semua" ? "semua kampus UNESA" : campusFilter}`,
      });
    }
    return list;
  }, [availableFaculties, campusFilter]);

  const locationOptions = useMemo<ComboboxOption[]>(() => {
    return filteredLocations.map((loc) => {
      const fac = detectFaculty(loc.building_name);
      return {
        value: loc.id,
        label: `${loc.building_name} (${loc.floor ? `${loc.floor}, ` : ""}${loc.room_or_area})`,
        description: `${loc.campus_name} · ${fac}`,
        badge: loc.building_name.split(" ")[0],
      };
    });
  }, [filteredLocations]);

  const categoryOptions = useMemo<ComboboxOption[]>(() => {
    return categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
      description: cat.description || undefined,
    }));
  }, [categories]);

  const handleImagesAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      toast.error("Maksimal 5 foto bukti ya!");
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      toast.info(`Hanya ${remainingSlots} foto yang ditambahkan (batas maksimal 5 foto).`);
    }

    setIsCompressing(true);
    const newItems: UploadedImageItem[] = [];

    try {
      for (const file of filesToProcess) {
        if (file.size > 25 * 1024 * 1024) {
          toast.error(`Foto "${file.name}" melebihi batas 25MB.`);
          continue;
        }

        const origKb = Math.round(file.size / 1024);
        let webpFile: File;
        try {
          webpFile = await convertToWebP(file);
        } catch {
          webpFile = file;
        }

        const compKb = Math.round(webpFile.size / 1024);
        const previewUrl = URL.createObjectURL(webpFile);

        newItems.push({
          id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          file: webpFile,
          previewUrl,
          origSizeKb: origKb,
          compSizeKb: compKb,
        });
      }

      if (newItems.length > 0) {
        setImages((prev) => [...prev, ...newItems]);
        toast.success(`${newItems.length} foto berhasil dioptimasi ke WebP!`);
      }
    } catch (err) {
      console.error("Gagal memproses foto:", err);
      toast.error("Sebagian foto gagal dioptimasi.");
    } finally {
      setIsCompressing(false);
      e.target.value = "";
    }
  };

  const removeImage = (idToRemove: string) => {
    setImages((prev) => {
      const target = prev.find((item) => item.id === idToRemove);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== idToRemove);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (!selectedLocationId || !selectedCategoryId) {
      toast.error("Pilih gedung dan kategori fasilitasnya terlebih dahulu.");
      return;
    }

    formData.set("locationId", selectedLocationId);
    formData.set("categoryId", selectedCategoryId);
    
    // Append all WebP image files (max 5)
    for (const img of images) {
      formData.append("images", img.file);
    }

    setIsSubmitting(true);

    try {
      // Capture details for aesthetic receipt
      const selectedLoc = locations.find((l) => l.id === selectedLocationId);
      const selectedCat = categories.find((c) => c.id === selectedCategoryId);
      const titleVal = ((formData.get("title") as string) || "").trim() || "Pengaduan Fasilitas Kampus";
      const campusName = selectedLoc ? selectedLoc.campus_name : "UNESA";
      const facultyName = selectedLoc ? detectFaculty(selectedLoc.building_name) : "Fasilitas Umum";
      const locationName = selectedLoc
        ? `${selectedLoc.building_name}${selectedLoc.floor ? `, ${selectedLoc.floor}` : ""}${selectedLoc.room_or_area ? ` (${selectedLoc.room_or_area})` : ""}`
        : "Area Kampus UNESA";
      const categoryName = selectedCat ? selectedCat.name : "Fasilitas Kampus";
      const photosCount = images.length;
      const now = new Date();
      const submittedAt =
        now.toLocaleDateString("id-ID", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
        ", " +
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }) +
        " WIB";

      const res = await submitPublicReport(formData);

      if (res.success && res.reportId) {
        toast.success("Laporan berhasil dikirim ke tim Sarpras UNESA.");
        setSuccessReport({
          reportId: res.reportId,
          nim: res.nim!,
          name: res.name!,
          title: titleVal,
          campusName,
          facultyName,
          locationName,
          categoryName,
          photosCount,
          submittedAt,
        });
        form.reset();
        images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
        setImages([]);
        setSelectedLocationId("");
        setSelectedCategoryId("");
        setCampusFilter("Semua");
        setSelectedFaculty("Semua");
      } else {
        toast.error(res.error || "Waduh, laporan gagal terkirim. Coba lagi ya!");
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error("Terjadi kendala jaringan. Coba beberapa saat lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    toast.success("Kode tiket berhasil disalin ke clipboard!");
    setTimeout(() => setHasCopied(false), 2500);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Step 1: Identitas Mahasiswa */}
        <div className="space-y-3.5 sm:space-y-4 p-4 sm:p-5 rounded-2xl bg-muted/30 border border-border/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <span className="flex size-7 items-center justify-center rounded-xl bg-primary text-primary-foreground font-mono text-xs font-black shadow-xs shrink-0">
              01
            </span>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-1.5">
                <span>Siapa yang Lapor?</span>
                <span className="text-[10px] sm:text-[11px] font-normal text-muted-foreground">
                  (Tanpa Login · Mahasiswa &amp; Dosen)
                </span>
              </h3>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                Cukup isi Nama &amp; NIM / NIP aktif untuk verifikasi identitas pelapor.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
            <Field>
              <FieldLabel htmlFor="name" className="text-xs font-semibold">Nama Lengkap</FieldLabel>
              <Input
                id="name"
                name="name"
                defaultValue={defaultUser?.name || ""}
                placeholder="Contoh: Ahmad Fauzi / Dr. Hendra Wijaya"
                required
                disabled={isSubmitting}
                className="h-11 sm:h-10 rounded-xl bg-background text-base sm:text-sm"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="nim" className="text-xs font-semibold">
                NIM / NIP (Nomor Induk Mahasiswa atau Dosen)
              </FieldLabel>
              <Input
                id="nim"
                name="nim"
                defaultValue={defaultUser?.identityNumber || ""}
                placeholder="Contoh: 21051214001 atau 19790320..."
                required
                disabled={isSubmitting}
                className="h-11 sm:h-10 rounded-xl bg-background text-base sm:text-sm font-mono"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Field>
              <FieldLabel htmlFor="phone" className="text-xs font-semibold flex flex-wrap items-center justify-between gap-1">
                <span>No. WhatsApp / HP Aktif</span>
                <span className="text-[10px] text-muted-foreground font-normal">Biar teknisi bisa konfirmasi</span>
              </FieldLabel>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={defaultUser?.phone || ""}
                placeholder="081234567890 (Opsional)"
                disabled={isSubmitting}
                className="h-11 sm:h-10 rounded-xl bg-background text-base sm:text-sm"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="faculty" className="text-xs font-semibold flex flex-wrap items-center justify-between gap-1">
                <span>Fakultas / Prodi Anda</span>
                <span className="text-[10px] text-muted-foreground font-normal">Opsional (Misal: FT / Informatika)</span>
              </FieldLabel>
              <Input
                id="faculty"
                name="faculty"
                placeholder="Contoh: S1 Teknik Informatika (FT)"
                disabled={isSubmitting}
                className="h-11 sm:h-10 rounded-xl bg-background text-base sm:text-sm"
              />
            </Field>
          </div>
        </div>

        {/* Step 2: Lokasi & Kategori Fasilitas */}
        <div className="space-y-3.5 sm:space-y-4 p-4 sm:p-5 rounded-2xl bg-muted/30 border border-border/80 shadow-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <span className="flex size-7 items-center justify-center rounded-xl bg-primary text-primary-foreground font-mono text-xs font-black shadow-xs shrink-0">
              02
            </span>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-foreground">
                Di Mana Lokasi Kerusakannya?
              </h3>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                Pilih kampus dan spot ruangan spesifik yang bermasalah.
              </p>
            </div>
          </div>

          {/* Campus Filter Chips (Mobile-friendly horizontal scroll / wrap) */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <MapPin className="size-3.5 text-primary" />
              <span>Filter Kampus:</span>
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap no-scrollbar">
              {[
                { label: "Semua Kampus", val: "Semua", icon: Building2 },
                { label: "Kampus Ketintang", val: "Ketintang", icon: MapPin },
                { label: "Kampus Lidah Wetan", val: "Lidah Wetan", icon: Landmark },
              ].map((chip) => {
                const Icon = chip.icon;
                return (
                  <button
                    key={chip.val}
                    type="button"
                    onClick={() => {
                      setCampusFilter(chip.val);
                      setSelectedFaculty("Semua");
                      setSelectedLocationId("");
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                      campusFilter === chip.val
                        ? "bg-primary text-primary-foreground shadow-xs font-bold"
                        : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="size-3.5 shrink-0" />
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Field: Pilih Fakultas / Unit (Searchable Combobox) */}
              <Field>
                <FieldLabel className="text-xs font-semibold flex items-center gap-1.5">
                  <GraduationCap className="size-3.5 text-primary" />
                  <span>Pilih Fakultas / Unit</span>
                </FieldLabel>
                <Combobox
                  options={facultyOptions}
                  value={selectedFaculty}
                  onValueChange={(val) => {
                    setSelectedFaculty(val || "Semua");
                    setSelectedLocationId("");
                  }}
                  placeholder="Pilih Fakultas / Unit..."
                  searchPlaceholder="Cari nama fakultas (cth: Teknik, FEB, FMIPA)..."
                  emptyText="Fakultas tidak ditemukan."
                  disabled={isSubmitting}
                  icon={<GraduationCap className="size-4" />}
                />
              </Field>

              {/* Field: Kategori Fasilitas (Searchable Combobox) */}
              <Field>
                <FieldLabel className="text-xs font-semibold flex items-center gap-1.5">
                  <Layers className="size-3.5 text-primary" />
                  <span>Kategori Fasilitas</span>
                </FieldLabel>
                <Combobox
                  options={categoryOptions}
                  value={selectedCategoryId}
                  onValueChange={(val) => setSelectedCategoryId(val || "")}
                  placeholder="Pilih Kategori Fasilitas..."
                  searchPlaceholder="Cari fasilitas (AC, listrik, proyektor, kran)..."
                  emptyText="Kategori fasilitas tidak ditemukan."
                  disabled={isSubmitting}
                  icon={<Layers className="size-4" />}
                />
              </Field>
            </div>

            {/* Field: Pilih Gedung & Ruangan Spesifik (Searchable Combobox) */}
            <Field>
              <FieldLabel className="text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-primary" />
                  <span>Pilih Gedung & Ruangan Spesifik</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  {filteredLocations.length} spot tersedia
                </span>
              </FieldLabel>
              <Combobox
                options={locationOptions}
                value={selectedLocationId}
                onValueChange={(val) => setSelectedLocationId(val || "")}
                placeholder="Ketik atau pilih ruang / gedung kampus..."
                searchPlaceholder="Cari nomor lab, kelas, gedung, atau lantai..."
                emptyText="Gedung atau ruangan tidak ditemukan."
                disabled={isSubmitting}
                icon={<Building2 className="size-4" />}
              />
            </Field>
          </div>
        </div>

        {/* Step 3: Detail Spill Kerusakan & Upload Foto */}
        <div className="space-y-3.5 sm:space-y-4 p-4 sm:p-5 rounded-2xl bg-muted/30 border border-border/80 shadow-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <span className="flex size-7 items-center justify-center rounded-xl bg-primary text-primary-foreground font-mono text-xs font-black shadow-xs shrink-0">
              03
            </span>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-foreground">
                Spill Detail & Bukti Kerusakan
              </h3>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                Makin detail infonya, makin cepat teknisi sarpras gercep eksekusi.
              </p>
            </div>
          </div>

          <Field>
            <FieldLabel htmlFor="title" className="text-xs font-semibold">Judul Kerusakan Singkat</FieldLabel>
            <Input
              id="title"
              name="title"
              placeholder="Misal: AC Lab E102 netes air / Proyektor mati total"
              required
              disabled={isSubmitting}
              className="h-11 sm:h-10 rounded-xl bg-background text-base sm:text-sm"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="description" className="text-xs font-semibold">Deskripsi Kendala</FieldLabel>
            <Textarea
              id="description"
              name="description"
              placeholder="Ceritain kondisinya secara detail: letak meja/posisi di ruangan, sejak kapan rusak, atau kendala spesifik lainnya..."
              required
              rows={3}
              disabled={isSubmitting}
              className="rounded-xl bg-background text-base sm:text-sm"
            />
          </Field>

          {/* Upload Zone (Multiple images up to 5) */}
          <Field>
            <FieldLabel className="text-xs font-semibold flex items-center justify-between">
              <span>Upload Foto Bukti Fisik (Biar Valid)</span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {images.length} / {MAX_IMAGES} Foto
              </span>
            </FieldLabel>
            <div className="mt-1.5 space-y-3">
              {/* Grid of uploaded images */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {images.map((img, idx) => (
                    <div
                      key={img.id}
                      className="group relative rounded-xl overflow-hidden border border-border bg-card p-1.5 flex flex-col items-center shadow-xs"
                    >
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.previewUrl}
                          alt={`Bukti kerusakan ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(img.id)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-destructive text-destructive-foreground shadow-md hover:scale-110 transition-transform cursor-pointer"
                          title="Hapus foto ini"
                        >
                          <X className="size-3" />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-xs text-[9px] text-white font-mono px-1.5 py-0.2 rounded-md">
                          #{idx + 1}
                        </div>
                      </div>
                      <div className="w-full pt-1 px-0.5 text-center">
                        <span className="text-[10px] font-mono text-muted-foreground block truncate">
                          {img.compSizeKb} KB · WebP
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Add more button if less than 5 */}
                  {images.length < MAX_IMAGES && !isCompressing && (
                    <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-border/80 hover:border-primary/60 bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer text-center p-2 group">
                      <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform mb-1">
                        <Plus className="size-4" />
                      </div>
                      <span className="text-[11px] font-semibold text-foreground leading-tight">
                        Tambah Foto
                      </span>
                      <span className="text-[9px] text-muted-foreground mt-0.5">
                        (Sisa {MAX_IMAGES - images.length})
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImagesAdd}
                        className="hidden"
                        disabled={isSubmitting || isCompressing}
                      />
                    </label>
                  )}
                </div>
              )}

              {/* Primary Empty Dropzone when 0 images */}
              {images.length === 0 && (
                <>
                  {isCompressing ? (
                    <div className="flex flex-col items-center justify-center p-8 space-y-2 border-2 border-dashed border-primary/50 rounded-2xl bg-primary/5">
                      <Loader2 className="size-7 text-primary animate-spin" />
                      <span className="text-xs font-semibold text-foreground">
                        Mengompresi foto ke WebP...
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Memperkecil ukuran berkas agar upload super cepat
                      </span>
                    </div>
                  ) : (
                    <label className="group flex flex-col items-center justify-center border-2 border-dashed border-border/80 hover:border-primary/60 rounded-2xl p-5 sm:p-6 cursor-pointer bg-card/60 hover:bg-muted/40 transition-all text-center space-y-2">
                      <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                        <UploadCloud className="size-6" />
                      </div>
                      <div>
                        <span className="font-semibold text-xs sm:text-sm text-foreground block">
                          Jepret langsung / Pilih foto (Bisa sampai 5 foto)
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-muted-foreground block mt-0.5">
                          Otomatis dikompres ke format WebP ringan & hemat kuota
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground group-hover:text-foreground">
                        <Camera className="size-3.5" />
                        <span>Pilih Berkas Foto</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImagesAdd}
                        className="hidden"
                        disabled={isSubmitting || isCompressing}
                      />
                    </label>
                  )}
                </>
              )}

              {/* Loading indicator when compressing more photos */}
              {images.length > 0 && isCompressing && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/5 text-primary text-xs font-medium">
                  <Loader2 className="size-3.5 animate-spin shrink-0" />
                  <span>Lagi mengompres foto tambahan ke WebP...</span>
                </div>
              )}
            </div>
          </Field>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full font-black text-sm sm:text-base h-12 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all"
          disabled={isSubmitting || isCompressing}
        >
          {isCompressing ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              <span>Mengoptimasi Foto ke WebP...</span>
            </>
          ) : isSubmitting ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              <span>Lagi Mengirim Laporan Kamu...</span>
            </>
          ) : (
            <>
              <Send className="size-4 mr-2" />
              <span>Kirim Laporan Sekarang</span>
            </>
          )}
        </Button>
      </form>

      {/* Aesthetic Digital Receipt / Ticket Stub Modal */}
      {successReport && (
        <Dialog open={true} onOpenChange={() => setSuccessReport(null)}>
          <DialogContent className="w-[calc(100vw-1.5rem)] max-w-[440px] p-0 gap-0 rounded-3xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden text-card-foreground max-h-[92vh] overflow-y-auto no-scrollbar">
            {/* Top decorative gradient bar */}
            <div className="h-2 w-full bg-gradient-to-r from-primary via-primary/80 to-primary/40 shrink-0" />

            {/* Header Struk */}
            <div className="p-5 sm:p-6 pb-3 text-center space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold tracking-wide">
                <ReceiptText className="size-3.5" />
                <span>SAFA UNESA · DIGITAL RECEIPT</span>
              </div>

              <div className="space-y-1">
                <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  Tiket Berhasil Dibuat!
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  Laporan kamu sudah masuk ke antrean tim Sarpras UNESA dan siap diverifikasi.
                </DialogDescription>
              </div>

              {/* Timestamp & Status Pill */}
              <div className="pt-2.5 flex items-center justify-between text-[11px] font-mono text-muted-foreground border-t border-border/60">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3 text-muted-foreground" />
                  {successReport.submittedAt}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold text-[10px]">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  MENUNGGU VERIFIKASI
                </span>
              </div>
            </div>

            {/* Perforated Divider 1 with cutout notches */}
            <div className="relative flex items-center justify-between py-1">
              <div className="size-5 -ml-2.5 rounded-full bg-background border border-border/80 shadow-inner" />
              <div className="w-full border-b-2 border-dashed border-border/70 mx-2" />
              <div className="size-5 -mr-2.5 rounded-full bg-background border border-border/80 shadow-inner" />
            </div>

            {/* Struk Line Breakdown */}
            <div className="px-5 sm:px-6 py-2 space-y-2.5 text-xs">
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-muted-foreground font-mono text-[11px] uppercase tracking-wider shrink-0">Pelapor</span>
                <span className="font-semibold text-foreground text-right truncate">{successReport.name}</span>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-muted-foreground font-mono text-[11px] uppercase tracking-wider shrink-0">NIM</span>
                <span className="font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded text-[11px] border border-border/50">
                  {successReport.nim}
                </span>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-muted-foreground font-mono text-[11px] uppercase tracking-wider shrink-0">Kampus & Unit</span>
                <span className="font-medium text-foreground text-right">{successReport.campusName} · {successReport.facultyName}</span>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-muted-foreground font-mono text-[11px] uppercase tracking-wider shrink-0">Lokasi Spot</span>
                <span className="font-medium text-foreground text-right max-w-[65%] line-clamp-2">{successReport.locationName}</span>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-muted-foreground font-mono text-[11px] uppercase tracking-wider shrink-0">Kategori</span>
                <span className="font-medium text-foreground text-right">{successReport.categoryName}</span>
              </div>
              <div className="flex justify-between items-baseline gap-3">
                <span className="text-muted-foreground font-mono text-[11px] uppercase tracking-wider shrink-0">Keluhan</span>
                <span className="font-medium text-foreground text-right italic max-w-[65%] line-clamp-1">&ldquo;{successReport.title}&rdquo;</span>
              </div>
              {successReport.photosCount > 0 && (
                <div className="flex justify-between items-baseline gap-3">
                  <span className="text-muted-foreground font-mono text-[11px] uppercase tracking-wider shrink-0">Lampiran</span>
                  <span className="font-mono font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[11px]">
                    {successReport.photosCount} Foto Terkompresi (WebP)
                  </span>
                </div>
              )}
            </div>

            {/* Perforated Divider 2 with cutout notches */}
            <div className="relative flex items-center justify-between py-1">
              <div className="size-5 -ml-2.5 rounded-full bg-background border border-border/80 shadow-inner" />
              <div className="w-full border-b-2 border-dashed border-border/70 mx-2" />
              <div className="size-5 -mr-2.5 rounded-full bg-background border border-border/80 shadow-inner" />
            </div>

            {/* Ticket Code & Barcode Area */}
            {(() => {
              const ticketCode = formatTicketCode(successReport.reportId);
              return (
                <div className="px-5 sm:px-6 py-2.5 space-y-3">
                  {/* Ticket Code Box */}
                  <div className="p-3.5 rounded-2xl bg-muted/50 border border-primary/20 flex items-center justify-between gap-2 shadow-2xs">
                    <div className="min-w-0 pr-1">
                      <div className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                        <Ticket className="size-3.5 text-primary" />
                        <span>KODE TIKET RESMI</span>
                      </div>
                      <div className="font-mono text-base sm:text-lg font-black text-primary tracking-wider mt-0.5 select-all">
                        {ticketCode}
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={hasCopied ? "default" : "secondary"}
                      onClick={() => copyToClipboard(ticketCode)}
                      className="shrink-0 h-9 px-3 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95 shadow-xs"
                    >
                      {hasCopied ? (
                        <>
                          <Check className="size-3.5 mr-1" />
                          <span>Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5 mr-1" />
                          <span>Salin Kode</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Barcode Graphic */}
                  <div className="pt-1 pb-1 flex flex-col items-center justify-center gap-1.5 select-none">
                    <div className="flex items-center justify-center gap-[2.5px] h-7 w-48 sm:w-56 opacity-75">
                      {[3, 1, 4, 2, 1, 3, 5, 2, 1, 4, 2, 3, 1, 5, 2, 4, 1, 3, 2, 4, 1, 5, 2, 3, 1, 4, 2, 3, 1, 4].map((width, idx) => (
                        <div
                          key={idx}
                          className="h-full bg-foreground/90 rounded-[0.5px]"
                          style={{ width: `${width}px` }}
                        />
                      ))}
                    </div>
                    <div className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase font-semibold">
                      * {ticketCode} *
                    </div>
                  </div>

                  {/* Gen-Z Helper Tip */}
                  <div className="p-2.5 rounded-xl bg-muted/30 border border-border/60 text-[11px] text-muted-foreground leading-relaxed flex items-start gap-2">
                    <Info className="size-3.5 text-primary shrink-0 mt-0.5" />
                    <span>
                      Brok, simpan struk ini atau salin kodenya ya! Kamu juga bisa cek proses perbaikan sewaktu-waktu pakai NIM kamu di menu <strong>Lacak Tiket</strong>.
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Modal Actions / Footer */}
            <div className="p-5 sm:p-6 pt-3 bg-muted/20 border-t border-border/60 flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="w-full rounded-xl text-xs sm:text-sm font-semibold h-11"
                onClick={() => setSuccessReport(null)}
              >
                Tutup & Lapor Lagi
              </Button>
              <Link
                href={`/reports/${successReport.reportId}`}
                className={buttonVariants({
                  className: "w-full rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm h-11 shadow-md shadow-primary/20",
                })}
              >
                <span>Lihat Status Tiket</span>
                <ExternalLink className="size-4" />
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
