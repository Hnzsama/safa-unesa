"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search,
  Loader2,
  Clock,
  ShieldCheck,
  XCircle,
  Wrench,
  CheckCircle2,
  Calendar,
  Building2,
  ArrowRight,
  Inbox,
  Sparkles,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { searchReportsByNimOrId } from "@/lib/actions/reports";
import { formatTicketCode } from "@/lib/utils";

interface TrackedReport {
  id: string;
  title: string;
  current_status: string;
  created_at: string;
  location?: {
    campus_name: string;
    building_name: string;
    room_or_area: string;
  } | null;
}

export function PublicReportTracker() {
  const [keyword, setKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<TrackedReport[]>([]);

  const handleSearch = async (queryValue?: string) => {
    const val = (queryValue ?? keyword).trim();
    if (!val) {
      toast.error("Harap masukkan NIM atau ID Tiket Laporan.");
      return;
    }

    if (queryValue) {
      setKeyword(queryValue);
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await searchReportsByNimOrId(val);
      if (res.success && res.reports) {
        setResults(res.reports);
        if (res.reports.length > 0) {
          toast.success(`Ditemukan ${res.reports.length} laporan aktif.`);
        }
      } else {
        toast.error(res.error || "Gagal melakukan pencarian.");
        setResults([]);
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error("Terjadi kendala saat mencari laporan.");
    } finally {
      setIsSearching(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <Badge
            variant="outline"
            className="gap-1.5 py-1 px-2.5 rounded-full border-border bg-muted/60 text-foreground font-semibold text-[11px]"
          >
            <span className="size-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <Clock className="size-3 text-muted-foreground" />
            <span>Menunggu Verifikasi</span>
          </Badge>
        );
      case "verified":
        return (
          <Badge className="gap-1.5 py-1 px-2.5 rounded-full bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20 font-semibold text-[11px]">
            <span className="size-2 rounded-full bg-primary shrink-0" />
            <ShieldCheck className="size-3" />
            <span>Terverifikasi (Valid)</span>
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="destructive"
            className="gap-1.5 py-1 px-2.5 rounded-full font-semibold text-[11px]"
          >
            <XCircle className="size-3" />
            <span>Laporan Ditolak</span>
          </Badge>
        );
      case "in_progress":
        return (
          <Badge
            variant="secondary"
            className="gap-1.5 py-1 px-2.5 rounded-full bg-primary text-primary-foreground font-bold text-[11px] shadow-xs"
          >
            <span className="size-2 rounded-full bg-primary-foreground animate-ping shrink-0" />
            <Wrench className="size-3" />
            <span>Teknisi OTW / Ditangani</span>
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="gap-1.5 py-1 px-2.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold text-[11px]">
            <CheckCircle2 className="size-3" />
            <span>Selesai Diperbaiki</span>
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="space-y-3"
      >
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Ketik NIM / NIP kamu (cth: 21051214001 / 19790320...) atau ID Tiket..."
              className="pl-10 h-11 sm:h-12 rounded-xl text-base sm:text-sm bg-background/80 border-border focus:ring-2 focus:ring-primary/20 font-medium"
              disabled={isSearching}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-11 sm:h-12 px-6 rounded-xl font-bold w-full sm:w-auto shrink-0 shadow-md hover:shadow-lg transition-all"
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                <span>Mencari...</span>
              </>
            ) : (
              <>
                <Search className="size-4 mr-2" />
                <span>Lacak Sekarang</span>
              </>
            )}
          </Button>
        </div>

        {/* Quick Demo Tag suggestion */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1 font-semibold text-foreground">
            <Sparkles className="size-3 text-primary" />
            <span>Contoh Cepat:</span>
          </span>
          <button
            type="button"
            onClick={() => handleSearch("21051214001")}
            className="px-2.5 py-1 rounded-lg bg-muted hover:bg-accent border border-border text-[11px] font-mono font-medium hover:text-foreground transition-colors cursor-pointer"
          >
            NIM: 21051214001
          </button>
          <span className="text-[11px] text-muted-foreground">
            (Klik chip di atas untuk tes lacak otomatis)
          </span>
        </div>
      </form>

      {/* Results Section */}
      {hasSearched && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1 pb-1 border-b border-border/50">
            <span>
              Hasil pencarian untuk: <strong className="text-foreground">&quot;{keyword}&quot;</strong>
            </span>
            <span className="font-semibold text-foreground">{results.length} Tiket Ditemukan</span>
          </div>

          {results.length === 0 ? (
            <div className="p-8 rounded-3xl border border-dashed border-border bg-card/60 backdrop-blur-xs text-center space-y-3">
              <div className="mx-auto size-12 rounded-2xl bg-muted/80 flex items-center justify-center text-muted-foreground">
                <Inbox className="size-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-foreground">Belum Ada Laporan yang Cocok</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Pastikan NIM atau ID tiket kamu sudah sesuai. Kalau baru pertama kali nemu kendala sarpras, cus lapor sekarang di tab sebelah!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((report) => (
                <Card
                  key={report.id}
                  className="hover:border-primary/50 transition-all shadow-xs group bg-card/90 rounded-2xl overflow-hidden hover:shadow-md"
                >
                  <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {renderStatusBadge(report.current_status)}
                        <span className="text-[11px] font-mono font-bold text-foreground bg-muted/80 px-2 py-0.5 rounded-md border border-border">
                          TIKET: {formatTicketCode(report.id)}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors">
                        {report.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {report.location && (
                          <span className="flex items-center gap-1.5 font-medium">
                            <Building2 className="size-3.5 text-primary" />
                            <span>
                              {report.location.campus_name} · {report.location.building_name} ({report.location.room_or_area})
                            </span>
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-muted-foreground" />
                          <span>
                            {new Date(report.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/reports/${report.id}`}
                      className={buttonVariants({
                        variant: "secondary",
                        size: "sm",
                        className:
                          "shrink-0 w-full sm:w-auto font-bold rounded-xl border border-border/80 hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground flex items-center gap-1.5 justify-center transition-all cursor-pointer shadow-xs",
                      })}
                    >
                      <span>Lihat Detail & Linimasa</span>
                      <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
