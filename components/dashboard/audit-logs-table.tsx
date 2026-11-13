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
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  User,
  Shield,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { formatTicketCode } from "@/lib/utils";
import Link from "next/link";

export interface AuditLogItem {
  id: string;
  previous_status: string | null;
  new_status: string;
  notes: string | null;
  created_at: string;
  changed_by_user: { name: string; role: string } | null;
  report: { id: string; title: string } | null;
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

const columnHelper = createColumnHelper<typeof features, AuditLogItem>();

interface AuditLogsTableProps {
  initialLogs: AuditLogItem[];
}

export function AuditLogsTable({ initialLogs }: AuditLogsTableProps) {
  const [data] = useState<AuditLogItem[]>(initialLogs);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge variant="outline" className="text-[10px]">Submitted</Badge>;
      case "verified":
        return <Badge className="bg-sky-500/10 text-sky-500 border border-sky-500/20 text-[10px]">Verified</Badge>;
      case "in_progress":
        return <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px]">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px]">Resolved</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="text-[10px]">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor("created_at", {
          header: ({ column }) => (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-3 h-8 text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              WAKTU (WIB)
              <ArrowUpDown className="ml-1.5 size-3" />
            </Button>
          ),
          cell: ({ row }) => (
            <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
              <Clock className="size-3 text-muted-foreground/70" />
              <span>
                {new Date(row.original.created_at).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ),
        }),
        columnHelper.display({
          id: "report_title",
          header: "LAPORAN TERKAIT",
          cell: ({ row }) => {
            const rep = row.original.report;
            if (!rep) return <span className="text-xs text-muted-foreground italic">-</span>;
            const code = formatTicketCode(rep.id);
            return (
              <div className="space-y-0.5">
                <Link
                  href={`/reports/${rep.id}`}
                  className="text-xs font-bold text-foreground hover:text-primary hover:underline line-clamp-1 block"
                >
                  {rep.title}
                </Link>
                <span className="font-mono text-[10px] text-primary">{code}</span>
              </div>
            );
          },
        }),
        columnHelper.display({
          id: "status_transition",
          header: "TRANSISI STATUS",
          cell: ({ row }) => (
            <div className="flex items-center gap-1.5 text-xs">
              {row.original.previous_status ? (
                <>
                  {renderStatusBadge(row.original.previous_status)}
                  <ArrowRight className="size-3 text-muted-foreground" />
                </>
              ) : null}
              {renderStatusBadge(row.original.new_status)}
            </div>
          ),
        }),
        columnHelper.accessor("notes", {
          header: "CATATAN OPERASIONAL",
          cell: ({ row }) => (
            <span className="text-xs text-muted-foreground line-clamp-2">
              {row.original.notes || "-"}
            </span>
          ),
        }),
        columnHelper.display({
          id: "actor",
          header: () => <div className="text-right">PETUGAS / AKTOR</div>,
          cell: ({ row }) => {
            const u = row.original.changed_by_user;
            return (
              <div className="flex items-center justify-end gap-1.5 text-right">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold text-foreground">
                    {u ? u.name : "Sistem Otomatis (Trigger)"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {u ? (u.role === "facility_staff" ? "Staf Sarpras" : u.role) : "System"}
                  </span>
                </div>
                <div className="p-1 rounded-full bg-muted text-muted-foreground">
                  {u ? <User className="size-3" /> : <Shield className="size-3 text-primary" />}
                </div>
              </div>
            );
          },
        }),
      ]),
     
    []
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchStatus =
        statusFilter === "all" ||
        item.new_status === statusFilter ||
        item.previous_status === statusFilter;

      const title = item.report?.title || "";
      const notes = item.notes || "";
      const userName = item.changed_by_user?.name || "";

      const matchSearch =
        !globalFilter ||
        title.toLowerCase().includes(globalFilter.toLowerCase()) ||
        notes.toLowerCase().includes(globalFilter.toLowerCase()) ||
        userName.toLowerCase().includes(globalFilter.toLowerCase());

      return matchStatus && matchSearch;
    });
  }, [data, statusFilter, globalFilter]);

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
              placeholder="Cari laporan, catatan, staf..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(val) => val && setStatusFilter(val)}>
            <SelectTrigger className="w-[170px] h-9 text-xs rounded-xl">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
                  Tidak ada data audit log yang sesuai dengan filter.
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
            Menampilkan <strong>{table.getRowModel().rows.length}</strong> dari <strong>{filteredData.length}</strong> log audit
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
    </div>
  );
}
