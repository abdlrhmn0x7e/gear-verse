import { Skeleton } from "~/components/ui/skeleton";

/**
 * A page that hasn't arrived yet, drawn in PageLayout's shape (the top bar,
 * the title and description, the toolbar and the first rows of a list) so the
 * real page lands where this one stood instead of replacing a spinner.
 */
export default function AdminLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col" aria-busy="true">
      <span className="sr-only" role="status">
        Loading
      </span>

      <div className="flex h-12 shrink-0 items-center gap-3 px-4 md:mx-1 md:px-2">
        <Skeleton className="size-7 rounded-lg" />
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:mx-1 md:mb-4.5">
        <div className="flex w-full flex-1 flex-col gap-6 p-4 md:px-9 md:pt-8 md:pb-3.5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-7 w-44" />
              <Skeleton className="h-4 w-80 max-w-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-full rounded-full sm:w-72" />
              <Skeleton className="hidden h-9 w-28 rounded-full sm:block" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex h-10 items-center gap-6 border-b px-3">
              <Skeleton className="h-3.5 w-14 shrink-0" />
              <div className="w-full">
                <Skeleton className="h-3.5 w-16" />
              </div>
              <Skeleton className="hidden h-3.5 w-24 shrink-0 sm:block" />
              <Skeleton className="hidden h-3.5 w-20 shrink-0 sm:block" />
            </div>
            {Array.from({ length: 6 }).map((_, row) => (
              <div
                key={row}
                className="flex h-16 items-center gap-6 border-b px-3"
              >
                <Skeleton className="h-4 w-14 shrink-0" />
                <div className="flex w-full min-w-0 items-center gap-3">
                  <Skeleton className="size-10 shrink-0 rounded-lg" />
                  <div className="flex w-full flex-col gap-2">
                    <Skeleton className="h-4 w-2/5" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
                <Skeleton className="hidden h-4 w-24 shrink-0 sm:block" />
                <Skeleton className="hidden h-5 w-20 shrink-0 rounded-full sm:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
