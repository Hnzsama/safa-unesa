import { Skeleton } from "@/components/ui/skeleton";

export default function ReportDetailLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <main className="flex-1 max-w-3xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-10 w-full space-y-6 animate-pulse">
        {/* Navigation Bar Skeleton */}
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-6 w-36 rounded-full" />
        </div>

        {/* Hero Card Skeleton */}
        <div className="p-5 sm:p-6 rounded-2xl border border-border/60 bg-card/60 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-6 w-36 rounded-md" />
              <Skeleton className="h-7 w-64 sm:w-80 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>

          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border/40">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>

        {/* Images Gallery Skeleton */}
        <div className="p-5 sm:p-6 rounded-2xl border border-border/60 bg-card/60 space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="aspect-square w-full rounded-xl" />
            <Skeleton className="aspect-square w-full rounded-xl" />
          </div>
        </div>

        {/* Timeline Skeleton */}
        <div className="p-5 sm:p-6 rounded-2xl border border-border/60 bg-card/60 space-y-4">
          <Skeleton className="h-5 w-44" />
          <div className="space-y-4 pt-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="size-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-2 p-3 rounded-xl border border-border/40">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

