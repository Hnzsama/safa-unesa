import { Skeleton } from "@/components/ui/skeleton";

export default function ResolvedLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <main className="flex-1 max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-10 w-full space-y-6 sm:space-y-8 animate-pulse">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border/50">
          <Skeleton className="h-8 w-36 rounded-lg" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>

        {/* Hero Section */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-52 rounded-full" />
          <Skeleton className="h-10 w-72 sm:w-96 rounded-lg" />
          <Skeleton className="h-4 w-full max-w-2xl rounded-md" />
          <Skeleton className="h-4 w-3/4 max-w-lg rounded-md" />
        </div>

        {/* Grid Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/70 overflow-hidden bg-card/60 space-y-3 p-0"
            >
              {/* Image banner */}
              <Skeleton className="aspect-[16/10] w-full rounded-none" />

              {/* Content */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3.5 w-20" />
                </div>
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />

                <div className="pt-2 space-y-2">
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 pt-0">
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

