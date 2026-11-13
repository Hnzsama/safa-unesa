import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsQueueLoading() {
  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 space-y-6 animate-pulse">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl border border-border/60 bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-8 w-72 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-md" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* Table Container Skeleton */}
      <div className="p-4 sm:p-6 rounded-2xl border border-border/60 bg-card/60 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
        <div className="space-y-2.5 pt-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
