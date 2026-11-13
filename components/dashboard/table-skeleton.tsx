import { Skeleton } from "@/components/ui/skeleton";

interface TableContentSkeletonProps {
  rowCount?: number;
  showToolbar?: boolean;
}

export function TableContentSkeleton({ rowCount = 6, showToolbar = true }: TableContentSkeletonProps) {
  return (
    <div className="space-y-4 animate-pulse">
      {showToolbar && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border">
          <div className="flex items-center gap-2.5 flex-1">
            <Skeleton className="h-9 w-64 rounded-xl" />
            <Skeleton className="h-9 w-36 rounded-xl hidden sm:block" />
          </div>
          <Skeleton className="h-9 w-40 rounded-xl" />
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {/* Table Header Skeleton */}
        <div className="bg-muted/40 p-3.5 flex items-center justify-between border-b border-border/50">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-20 hidden sm:block" />
          <Skeleton className="h-4 w-32 hidden md:block" />
          <Skeleton className="h-4 w-16" />
        </div>

        {/* Rows Skeleton */}
        <div className="divide-y divide-border/40">
          {[...Array(rowCount)].map((_, i) => (
            <div key={i} className="p-3.5 flex items-center justify-between gap-4">
              <Skeleton className="h-5 w-28 rounded-md" />
              <Skeleton className="h-4 w-44 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md hidden sm:block" />
              <Skeleton className="h-4 w-36 rounded-md hidden md:block" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="size-7 rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer Skeleton */}
        <div className="p-3 bg-muted/20 border-t border-border/40 flex items-center justify-between">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-6 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
