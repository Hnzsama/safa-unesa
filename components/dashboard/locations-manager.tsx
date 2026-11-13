"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  FlexRender,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
});

const columnHelper = createColumnHelper<typeof features, LocationRecord>();

interface LocationsManagerProps {
  initialLocations: LocationRecord[];
}

export function LocationsManager({ initialLocations }: LocationsManagerProps) {
  const [data, setData] = useState<LocationRecord[]>(initialLocations);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [globalFilter, setGlobalFilter] = useState("");
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
  const [isActive, setIsActive] = useState("active");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uniqueCampuses = useMemo(() => {
    return Array.from(new Set(data.map((loc) => loc.campus_name)));
  }, [data]);

  const openCreateModal = () => {
    setEditingLocation(null);
    setCampusName("Kampus Ketintang");
    setCustomCampus("");
    setBuildingName("");
    setFloor("");
    setRoomOrArea("");
    setIsActive("active");
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
    setIsActive(loc.is_active ? "active" : "inactive");
    setIsFormOpen(true);
  };

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("campus_name", {
          header: ({ column }) => (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-3 h-8 text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              KAMPUS
              <ArrowUpDown className="ml-1.5 size-3" />
            </Button>
          ),
          cell: ({ row }) => (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted text-foreground text-xs font-semibold">
              <MapPin className="size-3 text-primary" />
              {row.original.campus_name}
            </span>
          ),
        }),
        columnHelper.accessor("building_name", {
          header: ({ column }) => (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-3 h-8 text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              GEDUNG / FAKULTAS
              <ArrowUpDown className="ml-1.5 size-3" />
            </Button>
          ),
          cell: ({ row }) => (
            <span className="text-xs font-bold text-foreground">
              {row.original.building_name}
            </span>
          ),
        }),
        columnHelper.accessor("floor", {
          header: "LANTAI",
          cell: ({ row }) => (
            <span className="text-xs text-muted-foreground">
              {row.original.floor || "-"}
            </span>
          ),
        }),
        columnHelper.accessor("room_or_area", {
          header: "RUANG / AREA SPESIFIK",
          cell: ({ row }) => (
            <span className="text-xs text-foreground font-medium">
              {row.original.room_or_area}
            </span>
          ),
        }),
        columnHelper.accessor("is_active", {
          header: () => <div className="text-center">STATUS</div>,
          cell: ({ row }) => (
            <div className="flex justify-center">
              {row.original.is_active ? (
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
            </div>
          ),
        }),
        columnHelper.display({
          id: "actions",
          header: () => <div className="text-right">AKSI</div>,
          cell: ({ row }) => (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEditModal(row.original)}
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <Pencil className="size-3.5" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteConfirmLocation(row.original)}
                className="size-7 rounded-lg text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
                <span className="sr-only">Hapus</span>
              </Button>
            </div>
          ),
        }),
      ]),
     
    []
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchCampus = selectedCampus === "all" || item.campus_name === selectedCampus;
      const matchSearch =
        !globalFilter ||
        item.building_name.toLowerCase().includes(globalFilter.toLowerCase()) ||
        item.room_or_area.toLowerCase().includes(globalFilter.toLowerCase()) ||
        (item.floor && item.floor.toLowerCase().includes(globalFilter.toLowerCase())) ||
        item.campus_name.toLowerCase().includes(globalFilter.toLowerCase());
      return matchCampus && matchSearch;
    });
  }, [data, selectedCampus, globalFilter]);

  const table = useTable({
    features,
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getRowId: (row) => row.id,
  });

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
        const res = await updateLocationAction(editingLocation.id, {
          campus_name: finalCampus,
          building_name: buildingName.trim(),
          floor: floor.trim() || undefined,
          room_or_area: roomOrArea.trim(),
          is_active: isActive === "active",
        });

        if (res.success && res.location) {
          toast.success("Data lokasi berhasil diperbarui.");
          setData((prev) =>
            prev.map((l) => (l.id === editingLocation.id ? (res.location as LocationRecord) : l))
          );
          setIsFormOpen(false);
        } else {
          toast.error(res.error || "Gagal memperbarui lokasi.");
        }
      } else {
        const res = await createLocationAction({
          campus_name: finalCampus,
          building_name: buildingName.trim(),
          floor: floor.trim() || undefined,
          room_or_area: roomOrArea.trim(),
          is_active: isActive === "active",
        });

        if (res.success && res.location) {
          toast.success("Lokasi baru berhasil ditambahkan.");
          setData((prev) => [res.location as LocationRecord, ...prev]);
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
          setData((prev) =>
            prev.map((l) =>
              l.id === deleteConfirmLocation.id ? { ...l, is_active: false } : l
            )
          );
        } else {
          toast.success("Lokasi berhasil dihapus.");
          setData((prev) => prev.filter((l) => l.id !== deleteConfirmLocation.id));
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
      {/* TanStack Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari gedung, fakultas, ruang..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>

          {/* Campus Filter using shadcn Select */}
          <Select value={selectedCampus} onValueChange={(val) => setSelectedCampus(val || "all")}>
            <SelectTrigger className="w-[180px] h-9 text-xs rounded-xl">
              <SelectValue placeholder="Pilih Kampus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kampus</SelectItem>
              {uniqueCampuses.map((camp) => (
                <SelectItem key={camp} value={camp}>
                  {camp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      {/* TanStack Table Container */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-bold text-muted-foreground">
                    {header.isPlaceholder ? null : <FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-xs text-muted-foreground">
                  Tidak ada data lokasi yang sesuai dengan pencarian.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/30">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* TanStack Pagination Controls */}
        <div className="p-3 border-t border-border bg-muted/20 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            Menampilkan <strong>{table.getRowModel().rows.length}</strong> dari <strong>{filteredData.length}</strong> lokasi terfilter (Total: {data.length})
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[11px]">
              Hal {table.state.pagination.pageIndex + 1} dari {Math.max(1, table.getPageCount())}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-7 rounded-lg"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-7 rounded-lg"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-7 rounded-lg"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-7 rounded-lg"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight className="size-3.5" />
              </Button>
            </div>
          </div>
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
            {/* Kampus Selection using shadcn Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Kampus</Label>
              <Select value={campusName} onValueChange={(val) => val && setCampusName(val)}>
                <SelectTrigger className="w-full h-9 text-xs rounded-xl">
                  <SelectValue placeholder="Pilih Kampus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kampus Ketintang">Kampus Ketintang</SelectItem>
                  <SelectItem value="Kampus Lidah Wetan">Kampus Lidah Wetan</SelectItem>
                  <SelectItem value="other">+ Tambah Kampus Baru / Lainnya</SelectItem>
                </SelectContent>
              </Select>
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

            {/* Lantai & Status */}
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
                <Select value={isActive} onValueChange={(val) => val && setIsActive(val)}>
                  <SelectTrigger className="w-full h-9 text-xs rounded-xl">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
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
