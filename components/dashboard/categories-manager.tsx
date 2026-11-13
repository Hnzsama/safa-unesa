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
  Layers,
  Tag,
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
import { Textarea } from "@/components/ui/textarea";
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
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/lib/actions/dashboard";

export interface CategoryRecord {
  id: string;
  name: string;
  description: string | null;
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

const columnHelper = createColumnHelper<typeof features, CategoryRecord>();

interface CategoriesManagerProps {
  initialCategories: CategoryRecord[];
}

export function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const [data, setData] = useState<CategoryRecord[]>(initialCategories);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [globalFilter, setGlobalFilter] = useState("");

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRecord | null>(null);
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<CategoryRecord | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState("active");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setIsActive("active");
    setIsFormOpen(true);
  };

  const openEditModal = (cat: CategoryRecord) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setIsActive(cat.is_active ? "active" : "inactive");
    setIsFormOpen(true);
  };

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("name", {
          header: ({ column }) => (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-3 h-8 text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              NAMA KATEGORI
              <ArrowUpDown className="ml-1.5 size-3" />
            </Button>
          ),
          cell: ({ row }) => (
            <div className="flex items-center gap-2">
              <Tag className="size-3.5 text-primary shrink-0" />
              <span className="text-xs font-bold text-foreground">{row.original.name}</span>
            </div>
          ),
        }),
        columnHelper.accessor("description", {
          header: "DESKRIPSI & CAKUPAN KERUSAKAN",
          cell: ({ row }) => (
            <span className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {row.original.description || "Tidak ada deskripsi rinci."}
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
                onClick={() => setDeleteConfirmCategory(row.original)}
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
    if (!globalFilter) return data;
    return data.filter(
      (cat) =>
        cat.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(globalFilter.toLowerCase()))
    );
  }, [data, globalFilter]);

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

    if (!name.trim()) {
      toast.error("Nama kategori wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        const res = await updateCategoryAction(editingCategory.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          is_active: isActive === "active",
        });

        if (res.success && res.category) {
          toast.success("Kategori fasilitas berhasil diperbarui.");
          setData((prev) =>
            prev.map((c) => (c.id === editingCategory.id ? (res.category as CategoryRecord) : c))
          );
          setIsFormOpen(false);
        } else {
          toast.error(res.error || "Gagal memperbarui kategori.");
        }
      } else {
        const res = await createCategoryAction({
          name: name.trim(),
          description: description.trim() || undefined,
          is_active: isActive === "active",
        });

        if (res.success && res.category) {
          toast.success("Kategori fasilitas baru berhasil ditambahkan.");
          setData((prev) => [res.category as CategoryRecord, ...prev]);
          setIsFormOpen(false);
        } else {
          toast.error(res.error || "Gagal menambahkan kategori.");
        }
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmCategory) return;
    setIsSubmitting(true);
    try {
      const res = await deleteCategoryAction(deleteConfirmCategory.id);
      if (res.success) {
        if (res.message) {
          toast.info(res.message);
          setData((prev) =>
            prev.map((c) =>
              c.id === deleteConfirmCategory.id ? { ...c, is_active: false } : c
            )
          );
        } else {
          toast.success("Kategori berhasil dihapus.");
          setData((prev) => prev.filter((c) => c.id !== deleteConfirmCategory.id));
        }
        setDeleteConfirmCategory(null);
      } else {
        toast.error(res.error || "Gagal menghapus kategori.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menghapus kategori.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* TanStack Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border">
        {/* Search Box */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari nama kategori atau cakupan..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl"
          />
        </div>

        {/* Add Category Button */}
        <Button
          onClick={openCreateModal}
          size="sm"
          className="h-9 px-3.5 rounded-xl font-semibold gap-1.5 shadow-xs"
        >
          <Plus className="size-4" />
          <span>Tambah Kategori Baru</span>
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
                  Tidak ada data kategori yang sesuai dengan pencarian.
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
            Menampilkan <strong>{table.getRowModel().rows.length}</strong> dari <strong>{filteredData.length}</strong> kategori terfilter (Total: {data.length})
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
              <Layers className="size-4.5 text-primary" />
              <span>{editingCategory ? "Edit Kategori Fasilitas" : "Tambah Kategori Sarpras Baru"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Klasifikasikan jenis sarana prasarana untuk mempermudah alur penugasan teknisi.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3.5 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nama Kategori</Label>
              <Input
                type="text"
                placeholder="Contoh: Kelistrikan & AC, Sanitasi, Meubeler"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-xs rounded-xl"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Deskripsi &amp; Cakupan Kerusakan</Label>
              <Textarea
                placeholder="Jelaskan contoh kerusakan yang termasuk dalam kategori ini..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="text-xs rounded-xl resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Status Kategori</Label>
              <Select value={isActive} onValueChange={(val) => val && setIsActive(val)}>
                <SelectTrigger className="w-full h-9 text-xs rounded-xl">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif (Tampil di Form Pelaporan)</SelectItem>
                  <SelectItem value="inactive">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
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
                  <span>{editingCategory ? "Simpan Perubahan" : "Tambahkan Kategori"}</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog
        open={!!deleteConfirmCategory}
        onOpenChange={(open) => !open && setDeleteConfirmCategory(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2 text-destructive">
              <AlertCircle className="size-4" />
              <span>Hapus Kategori Fasilitas</span>
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed pt-1">
              Apakah Anda yakin ingin menghapus kategori <strong>{deleteConfirmCategory?.name}</strong>?
              <br />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Jika kategori ini telah digunakan pada tiket laporan aktif, sistem akan otomatis menonaktifkannya agar data riwayat tetap valid.
              </span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmCategory(null)}
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
                <span>Hapus Kategori</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
