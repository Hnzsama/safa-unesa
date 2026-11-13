"use client";

import { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface CategoriesManagerProps {
  initialCategories: CategoryRecord[];
}

export function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const [categories, setCategories] = useState<CategoryRecord[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRecord | null>(null);
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<CategoryRecord | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered List
  const filteredCategories = categories.filter((cat) => {
    return (
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setDescription("");
    setIsActive(true);
    setIsFormOpen(true);
  };

  const openEditModal = (cat: CategoryRecord) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setIsActive(cat.is_active);
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nama kategori wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        // Edit Mode
        const res = await updateCategoryAction(editingCategory.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          is_active: isActive,
        });

        if (res.success && res.category) {
          toast.success("Kategori fasilitas berhasil diperbarui.");
          setCategories((prev) =>
            prev.map((c) => (c.id === editingCategory.id ? (res.category as CategoryRecord) : c))
          );
          setIsFormOpen(false);
        } else {
          toast.error(res.error || "Gagal memperbarui kategori.");
        }
      } else {
        // Create Mode
        const res = await createCategoryAction({
          name: name.trim(),
          description: description.trim() || undefined,
          is_active: isActive,
        });

        if (res.success && res.category) {
          toast.success("Kategori fasilitas baru berhasil ditambahkan.");
          setCategories((prev) => [res.category as CategoryRecord, ...prev]);
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
          setCategories((prev) =>
            prev.map((c) =>
              c.id === deleteConfirmCategory.id ? { ...c, is_active: false } : c
            )
          );
        } else {
          toast.success("Kategori berhasil dihapus.");
          setCategories((prev) => prev.filter((c) => c.id !== deleteConfirmCategory.id));
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
      {/* Action & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border">
        {/* Search Box */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari nama kategori atau cakupan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Categories Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[260px] text-xs font-bold text-muted-foreground">NAMA KATEGORI</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground">DESKRIPSI &amp; CAKUPAN KERUSAKAN</TableHead>
              <TableHead className="w-[100px] text-center text-xs font-bold text-muted-foreground">STATUS</TableHead>
              <TableHead className="w-[110px] text-right text-xs font-bold text-muted-foreground">AKSI</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-xs text-muted-foreground">
                  Tidak ada data kategori yang sesuai dengan pencarian.
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((cat) => (
                <TableRow key={cat.id} className="hover:bg-muted/30">
                  <TableCell className="text-xs font-bold text-foreground">
                    <div className="flex items-center gap-2">
                      <Tag className="size-3.5 text-primary shrink-0" />
                      <span>{cat.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground leading-relaxed">
                    {cat.description || "Tidak ada deskripsi rinci."}
                  </TableCell>
                  <TableCell className="text-center">
                    {cat.is_active ? (
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
                        onClick={() => openEditModal(cat)}
                        className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="size-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteConfirmCategory(cat)}
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
          <span>Menampilkan <strong>{filteredCategories.length}</strong> dari <strong>{categories.length}</strong> kategori sarpras</span>
          <span>SAFA UNESA Standards</span>
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
              <select
                value={isActive ? "active" : "inactive"}
                onChange={(e) => setIsActive(e.target.value === "active")}
                className="w-full h-9 px-3 text-xs rounded-xl border border-input bg-background text-foreground font-medium outline-hidden"
              >
                <option value="active">Aktif (Tampil di Form Pelaporan)</option>
                <option value="inactive">Nonaktif</option>
              </select>
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
