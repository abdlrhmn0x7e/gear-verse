import { Skeleton } from "~/components/ui/skeleton";

/**
 * A page that hasn't arrived yet, drawn in PageLayout's shape (the header, the
 * toolbar and the first rows of a list) so the real page lands where this one
 * stood instead of replacing a spinner.
 */
export default function AdminLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col" aria-busy="true">
      <span className="sr-only" role="status">
        Loading
      </span>

      <div className="flex h-[58px] shrink-0 items-center gap-2 px-4">
        <Skeleton className="-ms-1.5 size-[30px] rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="ms-auto h-[30px] w-[30px] rounded-full sm:w-28" />
      </div>

      <div className="flex shrink-0 items-center gap-2 px-4 py-4">
        <Skeleton className="h-[30px] w-full rounded-full sm:w-72" />
        <Skeleton className="hidden h-[30px] w-28 rounded-full sm:block" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex h-[38px] shrink-0 items-center gap-6 border-y px-3">
          <Skeleton className="h-3 w-14 shrink-0" />
          <div className="w-full">
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="hidden h-3 w-24 shrink-0 sm:block" />
          <Skeleton className="hidden h-3 w-20 shrink-0 sm:block" />
        </div>
        {Array.from({ length: 10 }).map((_, row) => (
          <div
            key={row}
            className="flex h-[42px] shrink-0 items-center gap-6 border-b px-3"
          >
            <Skeleton className="h-3.5 w-14 shrink-0" />
            <div className="flex w-full min-w-0 items-center gap-3">
              <Skeleton className="size-7 shrink-0 rounded-md" />
              <Skeleton className="h-3.5 w-2/5" />
            </div>
            <Skeleton className="hidden h-3.5 w-24 shrink-0 sm:block" />
            <Skeleton className="hidden h-5 w-20 shrink-0 rounded-full sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
