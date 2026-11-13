import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 space-y-6 animate-pulse">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl border border-border/60 bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-36 rounded-full" />
          <Skeleton className="h-8 w-64 rounded-lg" />
          <Skeleton className="h-4 w-80 rounded-md" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 sm:p-5 rounded-2xl border border-border/60 bg-card/60 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>

      {/* Main Chart Card */}
      <div className="p-4 sm:p-6 rounded-2xl border border-border/60 bg-card/60 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-3.5 w-72" />
        <Skeleton className="h-64 sm:h-80 w-full rounded-xl" />
      </div>

      {/* 2 Distribution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="p-4 sm:p-5 rounded-2xl border border-border/60 bg-card/60 space-y-3">
            <Skeleton className="h-5 w-40" />
            <div className="space-y-2.5 pt-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
