import { Checkbox } from "~/components/ui/checkbox";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

export function FiltersSkeleton({ className }: { className?: string }) {
  return (
    <aside
      id="filters-skeleton"
      className={cn(
        "bg-card sticky top-32 hidden h-fit max-h-[calc(100vh-8rem)] overflow-y-scroll rounded-lg border p-4 pb-12 lg:block",
        className,
      )}
    >
      <div className="flex flex-col gap-8 divide-y [&>*:not(:last-child)]:pb-8">
        <CategoryFilterSkeleton />
        <BrandFilterSkeleton />
        <PriceFilterSkeleton />
      </div>
    </aside>
  );
}

function CategoryFilterSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-6 w-24" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <Checkbox disabled />
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BrandFilterSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-6 w-16" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <Checkbox disabled />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PriceFilterSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-6 w-12" />
      <Skeleton className="h-4 w-48" />
      <div className="relative">
        <Skeleton className="h-2 w-full rounded-full" />

        <Skeleton className="absolute top-1/2 left-0 size-4 -translate-y-1/2 rounded-full" />
        <Skeleton className="absolute top-1/2 right-0 size-4 -translate-y-1/2 rounded-full" />
      </div>
    </div>
  );
}
