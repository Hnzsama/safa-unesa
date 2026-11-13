"use client";

import { useState } from "react";
import {
  Building2,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createLocationAction,
  updateLocationAction,
  deleteLocationAction,
} from "@/lib/actions/dashboard";

export interface LocationRecord {
  id: string;
  campus_name: string;
  building_name: string;
  floor: string | null;
  room_or_area: string;
  is_active: boolean;
  created_at: string;
}

interface LocationsManagerProps {
  initialLocations: LocationRecord[];
}

export function LocationsManager({ initialLocations }: LocationsManagerProps) {
  const [locations, setLocations] = useState<LocationRecord[]>(initialLocations);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("all");

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationRecord | null>(null);
  const [deleteConfirmLocation, setDeleteConfirmLocation] = useState<LocationRecord | null>(null);

  // Form Fields
  const [campusName, setCampusName] = useState("Kampus Ketintang");
  const [customCampus, setCustomCampus] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [floor, setFloor] = useState("");
  const [roomOrArea, setRoomOrArea] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered List
  const filteredLocations = locations.filter((loc) => {
    const matchesSearch =
      loc.building_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.room_or_area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loc.floor && loc.floor.toLowerCase().includes(searchQuery.toLowerCase())) ||
      loc.campus_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCampus =
      selectedCampus === "all" || loc.campus_name === selectedCampus;

    return matchesSearch && matchesCampus;
  });

  const uniqueCampuses = Array.from(
    new Set(locations.map((loc) => loc.campus_name))
  );

  const openCreateModal = () => {
    setEditingLocation(null);
    setCampusName("Kampus Ketintang");
    setCustomCampus("");
    setBuildingName("");
    setFloor("");
    setRoomOrArea("");
    setIsActive(true);
    setIsFormOpen(true);
  };

  const openEditModal = (loc: LocationRecord) => {
    setEditingLocation(loc);
    if (["Kampus Ketintang", "Kampus Lidah Wetan"].includes(loc.campus_name)) {
      setCampusName(loc.campus_name);
      setCustomCampus("");
    } else {
      setCampusName("other");
      setCustomCampus(loc.campus_name);
    }
    setBuildingName(loc.building_name);
    setFloor(loc.floor || "");
    setRoomOrArea(loc.room_or_area);
    setIsActive(loc.is_active);
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCampus = campusName === "other" ? customCampus.trim() : campusName;

    if (!finalCampus) {
      toast.error("Nama kampus wajib diisi.");
      return;
    }
    if (!buildingName.trim()) {
      toast.error("Nama gedung / fakultas wajib diisi.");
      return;
    }
    if (!roomOrArea.trim()) {
      toast.error("Nama ruangan / area wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingLocation) {
        // Edit Mode
        const res = await updateLocationAction(editingLocation.id, {
          campus_name: finalCampus,
          building_name: buildingName.trim(),
          floor: floor.trim() || undefined,
          room_or_area: roomOrArea.trim(),
          is_active: isActive,
        });

        if (res.success && res.location) {
          toast.success("Data lokasi berhasil diperbarui.");
          setLocations((prev) =>
            prev.map((l) => (l.id === editingLocation.id ? (res.location as LocationRecord) : l))
          );
          setIsFormOpen(false);
        } else {
          toast.error(res.error || "Gagal memperbarui lokasi.");
        }
      } else {
        // Create Mode
        const res = await createLocationAction({
          campus_name: finalCampus,
          building_name: buildingName.trim(),
          floor: floor.trim() || undefined,
          room_or_area: roomOrArea.trim(),
          is_active: isActive,
        });

        if (res.success && res.location) {
          toast.success("Lokasi baru berhasil ditambahkan.");
          setLocations((prev) => [res.location as LocationRecord, ...prev]);
          setIsFormOpen(false);
        } else {
          toast.error(res.error || "Gagal menambahkan lokasi.");
        }
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmLocation) return;
    setIsSubmitting(true);
    try {
      const res = await deleteLocationAction(deleteConfirmLocation.id);
      if (res.success) {
        if (res.message) {
          toast.info(res.message);
          setLocations((prev) =>
            prev.map((l) =>
              l.id === deleteConfirmLocation.id ? { ...l, is_active: false } : l
            )
          );
        } else {
          toast.success("Lokasi berhasil dihapus.");
          setLocations((prev) => prev.filter((l) => l.id !== deleteConfirmLocation.id));
        }
        setDeleteConfirmLocation(null);
      } else {
        toast.error(res.error || "Gagal menghapus lokasi.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menghapus lokasi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari gedung, fakultas, ruang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>

          {/* Campus Filter */}
          <select
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value)}
            className="h-9 px-3 text-xs rounded-xl border border-input bg-background text-foreground font-medium outline-hidden"
          >
            <option value="all">Semua Kampus</option>
            {uniqueCampuses.map((camp) => (
              <option key={camp} value={camp}>
                {camp}
              </option>
            ))}
          </select>
        </div>

        {/* Add Location Button */}
        <Button
          onClick={openCreateModal}
          size="sm"
          className="h-9 px-3.5 rounded-xl font-semibold gap-1.5 shadow-xs"
        >
          <Plus className="size-4" />
          <span>Tambah Lokasi Baru</span>
        </Button>
      </div>

      {/* Locations Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[180px] text-xs font-bold text-muted-foreground">KAMPUS</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground">GEDUNG / FAKULTAS</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground">LANTAI</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground">RUANG / AREA SPESIFIK</TableHead>
              <TableHead className="w-[100px] text-center text-xs font-bold text-muted-foreground">STATUS</TableHead>
              <TableHead className="w-[110px] text-right text-xs font-bold text-muted-foreground">AKSI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                  Tidak ada data lokasi yang sesuai dengan pencarian.
                </TableCell>
              </TableRow>
            ) : (
              filteredLocations.map((loc) => (
                <TableRow key={loc.id} className="hover:bg-muted/30">
                  <TableCell className="text-xs font-semibold">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted text-foreground">
                      <MapPin className="size-3 text-primary" />
                      {loc.campus_name}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-foreground">
                    {loc.building_name}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {loc.floor || "-"}
                  </TableCell>
                  <TableCell className="text-xs text-foreground font-medium">
                    {loc.room_or_area}
                  </TableCell>
                  <TableCell className="text-center">
                    {loc.is_active ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] gap-1">
                        <CheckCircle2 className="size-3" />
                        <span>Aktif</span>
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-muted-foreground text-[10px] gap-1">
                        <XCircle className="size-3" />
                        <span>Nonaktif</span>
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(loc)}
                        className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="size-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirmLocation(loc)}
                        className="size-7 rounded-lg text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                        <span className="sr-only">Hapus</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="p-3 border-t border-border bg-muted/20 text-xs text-muted-foreground flex items-center justify-between">
          <span>Menampilkan <strong>{filteredLocations.length}</strong> dari <strong>{locations.length}</strong> lokasi terdaftar</span>
          <span>SAFA UNESA Master Directory</span>
        </div>
      </div>

      {/* Dialog Form: Create & Edit */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="size-4.5 text-primary" />
              <span>{editingLocation ? "Edit Data Lokasi" : "Tambah Lokasi Kampus Baru"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Masukkan informasi detail kampus, gedung/fakultas, lantai, dan ruangan fasilitas UNESA.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3.5 py-2">
            {/* Kampus Selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Kampus</Label>
              <select
                value={campusName}
                onChange={(e) => setCampusName(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-input bg-background text-foreground font-medium outline-hidden"
              >
                <option value="Kampus Ketintang">Kampus Ketintang</option>
                <option value="Kampus Lidah Wetan">Kampus Lidah Wetan</option>
                <option value="other">+ Tambah Kampus Baru / Lainnya</option>
              </select>
            </div>

            {campusName === "other" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Nama Kampus Baru</Label>
                <Input
                  type="text"
                  placeholder="Contoh: Kampus Magetan"
                  value={customCampus}
                  onChange={(e) => setCustomCampus(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>
            )}

            {/* Gedung / Fakultas */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Gedung / Fakultas</Label>
              <Input
                type="text"
                placeholder="Contoh: Gedung E1 (Fakultas Teknik) atau Gedung Rektorat"
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
                className="h-9 text-xs rounded-xl"
                required
              />
            </div>

            {/* Lantai & Ruang Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Lantai</Label>
                <Input
                  type="text"
                  placeholder="Contoh: Lantai 2"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Status Operasional</Label>
                <select
                  value={isActive ? "active" : "inactive"}
                  onChange={(e) => setIsActive(e.target.value === "active")}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-input bg-background text-foreground font-medium outline-hidden"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>

            {/* Ruangan / Area */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Ruangan / Area Spesifik</Label>
              <Input
                type="text"
                placeholder="Contoh: Lab Komputer E102, Ruang Seminar, Toilet Barat"
                value={roomOrArea}
                onChange={(e) => setRoomOrArea(e.target.value)}
                className="h-9 text-xs rounded-xl"
                required
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsFormOpen(false)}
                className="text-xs rounded-xl"
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs rounded-xl font-semibold gap-1.5"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>{editingLocation ? "Simpan Perubahan" : "Tambahkan Lokasi"}</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog
        open={!!deleteConfirmLocation}
        onOpenChange={(open) => !open && setDeleteConfirmLocation(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2 text-destructive">
              <AlertCircle className="size-4" />
              <span>Hapus Data Lokasi</span>
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed pt-1">
              Apakah Anda yakin ingin menghapus <strong>{deleteConfirmLocation?.room_or_area}</strong> di{" "}
              <strong>{deleteConfirmLocation?.building_name}</strong>?
              <br />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Jika lokasi ini terhubung dengan riwayat tiket laporan, sistem akan otomatis menonaktifkannya agar arsip tetap aman.
              </span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmLocation(null)}
              className="text-xs rounded-xl"
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="text-xs rounded-xl font-semibold gap-1.5"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <span>Hapus Lokasi</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

