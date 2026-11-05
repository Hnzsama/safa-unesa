"use client";

import { useState } from "react";
import {
  ImageIcon,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface ReportImageItem {
  id?: string;
  storage_path: string;
  mime_type?: string;
  file_size?: number;
}

interface ReportImageGalleryProps {
  images: ReportImageItem[];
}

export function ReportImageGallery({ images }: ReportImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

  const handlePrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : images.length - 1));
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! < images.length - 1 ? prev! + 1 : 0));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
          <ImageIcon className="size-3.5 text-primary" />
          <span>Klik foto untuk memperbesar resolusi</span>
        </span>
        <Badge variant="outline" className="font-mono text-[10px] px-2 py-0.5 border-border">
          {images.length} {images.length > 1 ? "Foto" : "Foto"}
        </Badge>
      </div>

      {/* Grid Layout based on image count */}
      {images.length === 1 ? (
        <div
          onClick={() => setSelectedIndex(0)}
          className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-muted/40 aspect-[16/10] sm:aspect-[16/9] transition-all hover:border-primary/60"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[0].storage_path}
            alt="Foto bukti fasilitas 1"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-medium text-xs backdrop-blur-2xs">
            <Maximize2 className="size-4" />
            <span>Perbesar Gambar</span>
          </div>
        </div>
      ) : images.length === 2 ? (
        <div className="grid grid-cols-2 gap-2.5">
          {images.map((img, idx) => (
            <div
              key={img.id || idx}
              onClick={() => setSelectedIndex(idx)}
              className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-muted/40 aspect-[4/3] transition-all hover:border-primary/60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.storage_path}
                alt={`Foto bukti fasilitas ${idx + 1}`}
                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-white backdrop-blur-xs">
                #{idx + 1}
              </span>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-medium text-xs backdrop-blur-2xs">
                <Maximize2 className="size-4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
          {images.map((img, idx) => (
            <div
              key={img.id || idx}
              onClick={() => setSelectedIndex(idx)}
              className={`group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-muted/40 transition-all hover:border-primary/60 ${
                idx === 0 && images.length % 2 !== 0 && images.length > 2
                  ? "col-span-2 sm:col-span-1 aspect-[16/9] sm:aspect-square"
                  : "aspect-square"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.storage_path}
                alt={`Foto bukti fasilitas ${idx + 1}`}
                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-white backdrop-blur-xs">
                #{idx + 1}
              </span>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-2xs">
                <Maximize2 className="size-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && selectedIndex !== null && (
        <Dialog open={true} onOpenChange={() => setSelectedIndex(null)}>
          <DialogContent className="w-[calc(100vw-2rem)] max-w-3xl p-0 overflow-hidden bg-black/95 border-border/60 text-white rounded-2xl shadow-2xl">
            <div className="p-3 sm:p-4 flex items-center justify-between border-b border-white/10">
              <div>
                <DialogTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Foto Bukti Fasilitas</span>
                  <Badge variant="secondary" className="font-mono text-[10px] bg-white/10 text-white border-0">
                    {selectedIndex + 1} / {images.length}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-[11px] text-zinc-400">
                  Resolusi asli hasil kompresi WebP dari mahasiswa
                </DialogDescription>
              </div>

              <div className="flex items-center gap-2 pr-8 sm:pr-9">
                <a
                  href={selectedImage.storage_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-300 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <ExternalLink className="size-3" />
                  <span className="hidden sm:inline">Buka Resolusi Penuh</span>
                </a>
              </div>
            </div>

            {/* Main Preview Container */}
            <div className="relative flex items-center justify-center min-h-[280px] max-h-[75vh] bg-zinc-950 p-2 sm:p-4 overflow-hidden select-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage.storage_path}
                alt={`Bukti resolusi penuh ${selectedIndex + 1}`}
                className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-lg"
              />

              {/* Prev / Next Buttons */}
              {images.length > 1 && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 size-9 sm:size-10 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/10 backdrop-blur-xs cursor-pointer shadow-md"
                  >
                    <ChevronLeft className="size-5 sm:size-6" />
                    <span className="sr-only">Sebelumnya</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 size-9 sm:size-10 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/10 backdrop-blur-xs cursor-pointer shadow-md"
                  >
                    <ChevronRight className="size-5 sm:size-6" />
                    <span className="sr-only">Selanjutnya</span>
                  </Button>
                </>
              )}
            </div>

            {/* Bottom thumbnail selector if > 1 images */}
            {images.length > 1 && (
              <div className="p-3 border-t border-white/10 bg-zinc-900/60 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar">
                {images.map((thumb, idx) => (
                  <button
                    key={thumb.id || idx}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    className={`size-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      selectedIndex === idx
                        ? "border-primary ring-2 ring-primary/40 scale-105"
                        : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb.storage_path}
                      alt={`Thumbnail ${idx + 1}`}
                      className="size-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

