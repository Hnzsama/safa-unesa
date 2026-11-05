"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import {
  Search,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  User,
  Phone,
  Mail,
  Layers,
  ExternalLink,
  Filter,
  Eye,
  AlertCircle,
  Loader2,
  Camera,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatTicketCode } from "@/lib/utils";
import { ReportTimeline } from "@/components/reports/report-timeline";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StaffReportItem, updateReportStatusAction, uploadResolutionProofAction } from "@/lib/actions/dashboard";
import { convertToWebP } from "@/lib/utils/image-compression";

interface ResolutionImageItem {
  id: string;
  file: File;
  previewUrl: string;
  sizeKb: number;
}

interface SafaReportsTableProps {
  initialReports: StaffReportItem[];
  currentUserId?: string;
  isStaff?: boolean;
}

export function SafaReportsTable({
  initialReports,
  currentUserId,
  isStaff = true,
}: SafaReportsTableProps) {
  const [reports, setReports] = useState<StaffReportItem[]>(initialReports);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<StaffReportItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Staff Action Form State
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionNotes, setActionNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [resolutionImages, setResolutionImages] = useState<ResolutionImageItem[]>([]);
  const [isCompressingProof, setIsCompressingProof] = useState(false);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = {
      all: reports.length,
      submitted: 0,
      in_progress: 0,
      resolved: 0,
      rejected: 0,
    };
    for (const r of reports) {
      if (r.current_status === "submitted") counts.submitted++;
      else if (r.current_status === "verified" || r.current_status === "in_progress") counts.in_progress++;
      else if (r.current_status === "resolved") counts.resolved++;
      else if (r.current_status === "rejected") counts.rejected++;
    }
    return counts;
  }, [reports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Tab filter
      if (activeTab === "submitted" && r.current_status !== "submitted") return false;
      if (activeTab === "in_progress" && r.current_status !== "verified" && r.current_status !== "in_progress") return false;
      if (activeTab === "resolved" && r.current_status !== "resolved") return false;
      if (activeTab === "rejected" && r.current_status !== "rejected") return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = r.title.toLowerCase().includes(q);
        const idMatch = r.id.toLowerCase().includes(q) || formatTicketCode(r.id).toLowerCase().includes(q);
        const reporterMatch = r.reporter?.name?.toLowerCase().includes(q);
        const nimMatch = r.reporter?.identity_number?.toLowerCase().includes(q);
        const locMatch =
          r.location?.building_name?.toLowerCase().includes(q) ||
          r.location?.campus_name?.toLowerCase().includes(q) ||
          r.location?.room_or_area?.toLowerCase().includes(q);
        const catMatch = r.category?.name?.toLowerCase().includes(q);
        return titleMatch || idMatch || reporterMatch || nimMatch || locMatch || catMatch;
      }
      return true;
    });
  }, [reports, activeTab, searchQuery]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    toast.success("ID Tiket berhasil disalin!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleOpenDetail = (rep: StaffReportItem) => {
    setSelectedReport(rep);
    setActionNotes("");
    setRejectionReason("");
    resolutionImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setResolutionImages([]);
    setIsDrawerOpen(true);
  };

  const handleResolutionFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = 3 - resolutionImages.length;
    if (remaining <= 0) {
      toast.error("Maksimal 3 foto bukti hasil perbaikan ya!");
      return;
    }

    setIsCompressingProof(true);
    const added: ResolutionImageItem[] = [];
    try {
      for (const file of files.slice(0, remaining)) {
        let webpFile: File;
        try {
          webpFile = await convertToWebP(file);
        } catch {
          webpFile = file;
        }
        added.push({
          id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          file: webpFile,
          previewUrl: URL.createObjectURL(webpFile),
          sizeKb: Math.round(webpFile.size / 1024),
        });
      }
      if (added.length > 0) {
        setResolutionImages((prev) => [...prev, ...added]);
        toast.success(`${added.length} foto bukti perbaikan siap diunggah.`);
      }
    } finally {
      setIsCompressingProof(false);
      e.target.value = "";
    }
  };

  const removeResolutionImage = (idToRemove: string) => {
    setResolutionImages((prev) => {
      const target = prev.find((i) => i.id === idToRemove);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((i) => i.id !== idToRemove);
    });
  };

  const handleResolveWithProof = async () => {
    if (!selectedReport || !currentUserId) return;
    setIsSubmittingAction(true);

    try {
      const formData = new FormData();
      formData.set("reportId", selectedReport.id);
      formData.set("staffUserId", currentUserId);
      formData.set(
        "notes",
        actionNotes.trim() || "Pekerjaan perbaikan fasilitas telah selesai dilaksanakan oleh teknisi sarpras."
      );

      for (const img of resolutionImages) {
        formData.append("resolution_images", img.file);
      }

      const res = await uploadResolutionProofAction(formData);

      if (res.success) {
        toast.success("Status berhasil diperbarui ke 'Selesai' dan foto bukti tersimpan!");
        const newImages = (res.imageUrls || []).map((url) => ({
          storage_path: url,
          mime_type: "image/webp;type=resolution",
        }));

        setReports((prev) =>
          prev.map((r) =>
            r.id === selectedReport.id
              ? {
                  ...r,
                  current_status: "resolved",
                  updated_at: new Date().toISOString(),
                  report_images: [...r.report_images, ...newImages],
                }
              : r
          )
        );

        setSelectedReport((prev) =>
          prev
            ? {
                ...prev,
                current_status: "resolved",
                updated_at: new Date().toISOString(),
                report_images: [...prev.report_images, ...newImages],
              }
            : null
        );

        resolutionImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
        setResolutionImages([]);
        setActionNotes("");
      } else {
        toast.error(res.error || "Gagal memperbarui status ke selesai.");
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error("Terjadi kendala saat mengunggah bukti perbaikan.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleStatusChange = async (newStatus: "verified" | "rejected" | "in_progress" | "resolved") => {
    if (!selectedReport || !currentUserId) {
      toast.error("Pengguna staf belum terautentikasi.");
      return;
    }

    if (newStatus === "rejected" && (!rejectionReason || rejectionReason.trim().length < 5)) {
      toast.error("Alasan penolakan wajib diisi minimal 5 karakter!");
      return;
    }

    setIsSubmittingAction(true);
    try {
      const res = await updateReportStatusAction({
        reportId: selectedReport.id,
        newStatus,
        notes: actionNotes.trim() || undefined,
        rejectionReason: rejectionReason.trim() || undefined,
        staffUserId: currentUserId,
      });

      if (res.success) {
        toast.success(`Status berhasil diperbarui menjadi "${newStatus}"!`);
        // Update local state
        setReports((prev) =>
          prev.map((r) =>
            r.id === selectedReport.id
              ? {
                  ...r,
                  current_status: newStatus,
                  rejection_reason: newStatus === "rejected" ? rejectionReason.trim() : null,
                  updated_at: new Date().toISOString(),
                }
              : r
          )
        );
        setSelectedReport((prev) =>
          prev
            ? {
                ...prev,
                current_status: newStatus,
                rejection_reason: newStatus === "rejected" ? rejectionReason.trim() : null,
                updated_at: new Date().toISOString(),
              }
            : null
        );
        setActionNotes("");
        setRejectionReason("");
      } else {
        toast.error(res.error || "Gagal memperbarui status laporan.");
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error("Terjadi kendala jaringan saat memperbarui status.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const renderStatusBadge = (status: StaffReportItem["current_status"]) => {
    switch (status) {
      case "submitted":
        return (
          <Badge variant="outline" className="gap-1 border-amber-500/30 text-amber-500 bg-amber-500/10 text-[11px] font-semibold py-0.5">
            <Clock className="size-3" />
            <span>Menunggu Verifikasi</span>
          </Badge>
        );
      case "verified":
        return (
          <Badge className="gap-1 bg-sky-500/10 text-sky-500 border border-sky-500/20 text-[11px] font-semibold py-0.5">
            <ShieldCheck className="size-3" />
            <span>Terverifikasi</span>
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="gap-1 bg-primary/10 text-primary border border-primary/20 text-[11px] font-bold py-0.5">
            <Wrench className="size-3" />
            <span>Sedang Ditangani</span>
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="gap-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px] font-semibold py-0.5">
            <CheckCircle2 className="size-3" />
            <span>Selesai</span>
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1 text-[11px] font-semibold py-0.5">
            <XCircle className="size-3" />
            <span>Ditolak</span>
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4 px-4 lg:px-6">
      {/* Table Toolbar & Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-5 w-full sm:w-auto h-10 p-1 bg-muted/60 rounded-xl">
            <TabsTrigger value="all" className="text-xs font-semibold rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs">
              Semua ({tabCounts.all})
            </TabsTrigger>
            <TabsTrigger value="submitted" className="text-xs font-semibold rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs">
              Masuk ({tabCounts.submitted})
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="text-xs font-semibold rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs">
              Proses ({tabCounts.in_progress})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="text-xs font-semibold rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs">
              Selesai ({tabCounts.resolved})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="text-xs font-semibold rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-xs">
              Ditolak ({tabCounts.rejected})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari keluhan, pelapor, spot gedung..."
            className="pl-9 h-10 rounded-xl text-xs bg-card border-border/80"
          />
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40 border-b border-border">
              <TableRow>
                <TableHead className="w-[140px] text-xs font-bold text-muted-foreground">ID &amp; TANGGAL</TableHead>
                <TableHead className="min-w-[220px] text-xs font-bold text-muted-foreground">KELUHAN FASILITAS</TableHead>
                <TableHead className="min-w-[180px] text-xs font-bold text-muted-foreground">LOKASI GEDUNG</TableHead>
                <TableHead className="min-w-[150px] text-xs font-bold text-muted-foreground">PELAPOR</TableHead>
                <TableHead className="w-[160px] text-xs font-bold text-muted-foreground">STATUS</TableHead>
                <TableHead className="w-[100px] text-right text-xs font-bold text-muted-foreground">AKSI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-xs text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Filter className="size-6 text-muted-foreground/60" />
                      <span className="font-medium">Tidak ada laporan yang cocok dengan kriteria filter saat ini.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((rep) => (
                  <TableRow
                    key={rep.id}
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => handleOpenDetail(rep)}
                  >
                    <TableCell className="align-top py-3.5">
                      <div className="space-y-1">
                        <span className="font-mono font-bold text-[11px] text-primary block">
                          {formatTicketCode(rep.id)}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          {new Date(rep.created_at).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="align-top py-3.5">
                      <div className="space-y-1">
                        <span className="font-bold text-xs text-foreground block line-clamp-1">
                          {rep.title}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Layers className="size-3 text-primary shrink-0" />
                          <span>{rep.category?.name || "Umum"}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="align-top py-3.5 text-xs">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground block">
                          {rep.location?.building_name || "Kampus UNESA"}
                        </span>
                        <span className="text-[11px] text-muted-foreground block">
                          {rep.location?.floor ? `${rep.location.floor}, ` : ""}
                          {rep.location?.room_or_area || "-"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="align-top py-3.5 text-xs">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground block truncate">
                          {rep.reporter?.name || "Civitas UNESA"}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase">
                            {rep.reporter?.role === "lecturer" ? "Dosen" : "Mahasiswa"}
                          </Badge>
                          <span>({rep.reporter?.identity_number || "-"})</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="align-top py-3.5">
                      {renderStatusBadge(rep.current_status)}
                    </TableCell>

                    <TableCell className="align-top py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenDetail(rep)}
                        className="h-8 px-2.5 text-xs font-bold rounded-lg hover:bg-primary/10 hover:text-primary gap-1 cursor-pointer"
                      >
                        <Eye className="size-3.5" />
                        <span>Detail</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-border/80 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <span>Menampilkan <strong>{filteredReports.length}</strong> dari <strong>{reports.length}</strong> total laporan sarpras</span>
          <span className="font-mono text-[11px]">Sistem SAFA UNESA</span>
        </div>
      </div>

      {/* DETAIL DRAWER / INSPECTION MODAL */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-w-2xl mx-auto rounded-t-3xl max-h-[90vh] bg-card border-border/80 shadow-2xl overflow-hidden flex flex-col">
          {selectedReport && (
            <>
              <DrawerHeader className="p-5 sm:p-6 pb-3 border-b border-border/60 shrink-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {renderStatusBadge(selectedReport.current_status)}
                    <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(selectedReport.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })} WIB
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(formatTicketCode(selectedReport.id))}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-xs font-mono font-bold hover:bg-muted/80 cursor-pointer"
                  >
                    {copiedId ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                    <span>{formatTicketCode(selectedReport.id)}</span>
                  </button>
                </div>

                <DrawerTitle className="text-lg sm:text-xl font-black text-foreground pt-1.5 leading-snug">
                  {selectedReport.title}
                </DrawerTitle>
                <DrawerDescription className="text-xs text-muted-foreground">
                  Laporan tercatat pada sistem operasional sarpras kampus Universitas Negeri Surabaya.
                </DrawerDescription>
              </DrawerHeader>

              {/* Drawer Content Tabs */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                {/* Alert jika status rejected */}
                {selectedReport.current_status === "rejected" && (
                  <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-sm">
                      <XCircle className="size-4" />
                      Alasan Penolakan:
                    </span>
                    <p className="leading-relaxed pl-5 font-medium">
                      {selectedReport.rejection_reason || "Tidak memenuhi kriteria kelayakan perbaikan fasilitas."}
                    </p>
                  </div>
                )}

                {/* Grid Identitas Pelapor & Lokasi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Kartu Pelapor */}
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-2">
                    <span className="text-[11px] font-mono uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
                      <User className="size-3.5 text-primary" />
                      <span>Identitas Pelapor</span>
                    </span>
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-foreground text-sm">{selectedReport.reporter?.name || "Civitas UNESA"}</div>
                      <div className="text-muted-foreground">
                        Nomor Induk: <strong className="text-foreground">{selectedReport.reporter?.identity_number || "-"}</strong> ({selectedReport.reporter?.role === "lecturer" ? "Dosen" : "Mahasiswa"})
                      </div>
                      {selectedReport.reporter?.phone_number && (
                        <div className="text-muted-foreground flex items-center gap-1">
                          <Phone className="size-3" />
                          <span>{selectedReport.reporter.phone_number}</span>
                        </div>
                      )}
                      {selectedReport.reporter?.email && (
                        <div className="text-muted-foreground flex items-center gap-1">
                          <Mail className="size-3" />
                          <span>{selectedReport.reporter.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Kartu Lokasi & Kategori */}
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-2">
                    <span className="text-[11px] font-mono uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-primary" />
                      <span>Lokasi &amp; Kategori</span>
                    </span>
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-foreground text-sm">
                        {selectedReport.location?.campus_name}
                      </div>
                      <div className="text-muted-foreground">
                        Gedung: <strong className="text-foreground">{selectedReport.location?.building_name}</strong>
                      </div>
                      <div className="text-muted-foreground">
                        Spot: <strong className="text-foreground">{selectedReport.location?.floor ? `${selectedReport.location.floor}, ` : ""}{selectedReport.location?.room_or_area}</strong>
                      </div>
                      <div className="text-muted-foreground flex items-center gap-1 pt-0.5">
                        <Layers className="size-3 text-primary" />
                        <span>Kategori: <strong>{selectedReport.category?.name || "Umum"}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deskripsi Masalah */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground uppercase font-mono">
                    Deskripsi Lengkap Kerusakan:
                  </span>
                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/80 text-xs text-foreground leading-relaxed whitespace-pre-line">
                    {selectedReport.description}
                  </div>
                </div>

                {/* 1. Foto Bukti Hasil Perbaikan oleh Petugas */}
                {selectedReport.report_images &&
                  selectedReport.report_images.some(
                    (img) => img.storage_path.includes("resolution_") || img.mime_type?.includes("resolution")
                  ) && (
                    <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase font-mono">
                          <CheckCircle2 className="size-3.5" />
                          <span>Foto Bukti Hasil Perbaikan Petugas Sarpras</span>
                        </span>
                        <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 text-[9px] font-bold">
                          Tuntas Diperbaiki
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {selectedReport.report_images
                          .filter((img) => img.storage_path.includes("resolution_") || img.mime_type?.includes("resolution"))
                          .map((img, idx) => (
                            <a
                              key={img.id || idx}
                              href={img.storage_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative rounded-xl overflow-hidden border border-emerald-500/30 aspect-[4/3] bg-muted/50 block shadow-xs"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img.storage_path}
                                alt={`Bukti perbaikan ${idx + 1}`}
                                className="size-full object-cover transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-semibold gap-1">
                                <ExternalLink className="size-3.5" />
                                <span>Perbesar</span>
                              </div>
                            </a>
                          ))}
                      </div>
                    </div>
                  )}

                {/* 2. Foto Bukti Kerusakan Awal dari Pelapor */}
                {selectedReport.report_images &&
                  selectedReport.report_images.some(
                    (img) => !img.storage_path.includes("resolution_") && !img.mime_type?.includes("resolution")
                  ) && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase font-mono flex items-center gap-1.5">
                        <Camera className="size-3.5 text-primary" />
                        <span>Foto Bukti Kerusakan Awal dari Pelapor:</span>
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {selectedReport.report_images
                          .filter((img) => !img.storage_path.includes("resolution_") && !img.mime_type?.includes("resolution"))
                          .map((img, idx) => (
                            <a
                              key={img.id || idx}
                              href={img.storage_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative rounded-xl overflow-hidden border border-border aspect-[4/3] bg-muted/50 block"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img.storage_path}
                                alt={`Foto keluhan ${idx + 1}`}
                                className="size-full object-cover transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-semibold gap-1">
                                <ExternalLink className="size-3.5" />
                                <span>Buka</span>
                              </div>
                            </a>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Linimasa Audit Trail */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase font-mono block">
                    Riwayat Linimasa (Audit Trail):
                  </span>
                  <ReportTimeline logs={selectedReport.report_status_logs} />
                </div>

                {/* FORM AKSI KHUSUS STAF SARPRAS */}
                {isStaff && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-primary/20 space-y-4 pt-4 mt-4">
                    <div className="flex items-center justify-between border-b border-border/80 pb-2">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase font-mono">
                        <Wrench className="size-4 text-primary" />
                        <span>Panel Aksi Petugas Sarpras</span>
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Siklus State Machine SAFA
                      </span>
                    </div>

                    {/* Jika status SUBMITTED: Opsi Approve atau Reject */}
                    {selectedReport.current_status === "submitted" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-foreground">
                            Catatan Verifikasi (Opsional):
                          </label>
                          <Input
                            value={actionNotes}
                            onChange={(e) => setActionNotes(e.target.value)}
                            placeholder="Cth: Laporan valid, segera diteruskan ke unit teknisi."
                            className="h-9 text-xs bg-background"
                            disabled={isSubmittingAction}
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            type="button"
                            onClick={() => handleStatusChange("verified")}
                            disabled={isSubmittingAction}
                            className="flex-1 font-bold rounded-xl bg-primary text-primary-foreground h-10 shadow-xs"
                          >
                            {isSubmittingAction ? (
                              <Loader2 className="size-4 animate-spin mr-2" />
                            ) : (
                              <ShieldCheck className="size-4 mr-2" />
                            )}
                            <span>Setujui (Verifikasi Laporan)</span>
                          </Button>
                        </div>

                        {/* Form Tolak Laporan */}
                        <div className="pt-2 border-t border-border/60 space-y-2">
                          <label className="text-xs font-semibold text-destructive flex items-center gap-1">
                            <AlertCircle className="size-3.5" />
                            <span>Atau Tolak Laporan (Wajib Isi Alasan):</span>
                          </label>
                          <Textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Alasan penolakan (minimal 5 karakter, cth: Lokasi bukan kewenangan UNESA, duplikasi laporan, dll)..."
                            className="text-xs bg-background min-h-[60px]"
                            disabled={isSubmittingAction}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => handleStatusChange("rejected")}
                            disabled={isSubmittingAction || rejectionReason.trim().length < 5}
                            className="w-full font-bold rounded-xl h-9 text-xs"
                          >
                            <XCircle className="size-3.5 mr-1.5" />
                            <span>Tolak Laporan Ini</span>
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Jika status VERIFIED: Tombol Mulai Penanganan */}
                    {selectedReport.current_status === "verified" && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-foreground">
                            Catatan Penugasan Teknisi:
                          </label>
                          <Input
                            value={actionNotes}
                            onChange={(e) => setActionNotes(e.target.value)}
                            placeholder="Cth: Teknisi Joko ditugaskan membawa suku cadang ke lokasi."
                            className="h-9 text-xs bg-background"
                            disabled={isSubmittingAction}
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => handleStatusChange("in_progress")}
                          disabled={isSubmittingAction}
                          className="w-full font-bold rounded-xl bg-primary text-primary-foreground h-10 shadow-xs"
                        >
                          {isSubmittingAction ? (
                            <Loader2 className="size-4 animate-spin mr-2" />
                          ) : (
                            <Wrench className="size-4 mr-2" />
                          )}
                          <span>Mulai Penanganan (In Progress)</span>
                        </Button>
                      </div>
                    )}

                    {/* Jika status IN_PROGRESS: Form Selesaikan + Upload Bukti Perbaikan */}
                    {selectedReport.current_status === "in_progress" && (
                      <div className="space-y-3.5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-foreground">
                            Catatan Penyelesaian Perbaikan:
                          </label>
                          <Input
                            value={actionNotes}
                            onChange={(e) => setActionNotes(e.target.value)}
                            placeholder="Cth: Komponen telah diganti dan fasilitas telah diuji normal kembali."
                            className="h-9 text-xs bg-background"
                            disabled={isSubmittingAction || isCompressingProof}
                          />
                        </div>

                        {/* Upload Foto Bukti Perbaikan */}
                        <div className="space-y-2 p-3 rounded-xl bg-card border border-border/80">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground flex items-center gap-1.5">
                              <Camera className="size-3.5 text-emerald-500" />
                              <span>Foto Bukti Fisik Hasil Perbaikan (Maks 3):</span>
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {resolutionImages.length}/3 Foto
                            </span>
                          </div>

                          {/* Grid Previews */}
                          {resolutionImages.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 pt-1">
                              {resolutionImages.map((img) => (
                                <div key={img.id} className="relative rounded-lg overflow-hidden border border-border aspect-square bg-muted">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={img.previewUrl} alt="Preview bukti perbaikan" className="size-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => removeResolutionImage(img.id)}
                                    className="absolute top-1 right-1 size-5 rounded-full bg-destructive text-white flex items-center justify-center hover:opacity-90 shadow-xs cursor-pointer"
                                  >
                                    <X className="size-3" />
                                  </button>
                                  <span className="absolute bottom-1 left-1 bg-black/70 text-[9px] font-mono text-white px-1 rounded">
                                    {img.sizeKb} KB
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {resolutionImages.length < 3 && (
                            <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border hover:border-emerald-500/50 hover:bg-emerald-500/5 cursor-pointer transition-all text-xs text-muted-foreground">
                              <UploadCloud className="size-4 text-emerald-500" />
                              <span className="font-medium">
                                {isCompressingProof ? "Mengompresi Foto WebP..." : "Pilih / Ambil Foto Bukti Fisik"}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleResolutionFiles}
                                className="hidden"
                                disabled={isSubmittingAction || isCompressingProof}
                              />
                            </label>
                          )}
                        </div>

                        <Button
                          type="button"
                          onClick={handleResolveWithProof}
                          disabled={isSubmittingAction || isCompressingProof}
                          className="w-full font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-10 shadow-md shadow-emerald-600/20"
                        >
                          {isSubmittingAction ? (
                            <Loader2 className="size-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle2 className="size-4 mr-2" />
                          )}
                          <span>
                            {resolutionImages.length > 0
                              ? `Tandai Selesai & Kirim ${resolutionImages.length} Foto Bukti`
                              : "Tandai Selesai Diperbaiki (Resolved)"}
                          </span>
                        </Button>
                      </div>
                    )}

                    {/* Jika status RESOLVED atau REJECTED */}
                    {(selectedReport.current_status === "resolved" || selectedReport.current_status === "rejected") && (
                      <div className="text-center py-2 text-xs text-muted-foreground">
                        Laporan ini telah mencapai status akhir (<strong>{selectedReport.current_status.toUpperCase()}</strong>).
                      </div>
                    )}
                  </div>
                )}
              </div>

              <DrawerFooter className="p-4 sm:p-5 border-t border-border/60 bg-muted/20 shrink-0 flex flex-row justify-between items-center gap-2">
                <Link
                  href={`/reports/${selectedReport.id}`}
                  className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
                  target="_blank"
                >
                  <span>Buka Halaman Publik</span>
                  <ExternalLink className="size-3.5" />
                </Link>

                <DrawerClose render={<Button variant="outline" className="rounded-xl text-xs h-9 font-semibold">Tutup</Button>} />
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
