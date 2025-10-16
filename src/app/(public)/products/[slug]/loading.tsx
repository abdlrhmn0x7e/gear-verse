import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { Skeleton } from "~/components/ui/skeleton";

export default function ProductPageLoading() {
  return (
    <section className="py-24">
      <MaxWidthWrapper className="relative space-y-4 lg:grid lg:grid-cols-2">
        {/* Left column: Carousel skeleton */}
        <div className="mx-auto h-fit w-4/5 lg:sticky lg:top-24">
          <AspectRatio ratio={1} className="w-full">
            <Skeleton className="size-full" />
          </AspectRatio>

          <div className="mt-3 flex gap-3">
            <Skeleton className="size-20 flex-shrink-0" />
            <Skeleton className="size-20 flex-shrink-0" />
            <Skeleton className="size-20 flex-shrink-0" />
            <Skeleton className="size-20 flex-shrink-0" />
          </div>
        </div>

        {/* Right column: Product details */}
        <div className="space-y-8 divide-y [&>*:not(:last-child)]:pb-8">
          {/* First section: Product info and options */}
          <div className="space-y-8">
            {/* Title and badge */}
            <div className="space-y-2 text-center lg:text-left">
              <div className="flex flex-col items-center justify-between gap-2 lg:flex-row lg:items-start">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-9 w-32" />
              </div>

              <Skeleton className="mx-auto h-5 w-5/6 lg:mx-0" />
              <Skeleton className="mx-auto h-5 w-2/3 lg:mx-0" />
            </div>

            {/* Price and rating */}
            <div className="flex flex-col items-center justify-between gap-2 lg:flex-row">
              <div className="space-x-2">
                <Skeleton className="inline-block h-10 w-40" />
                <Skeleton className="inline-block h-6 w-24" />
              </div>

              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>

            {/* Variants section */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-48" />
              </div>

              <div className="space-y-4 p-2">
                {/* First option with thumbnails */}
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />

                  <div className="flex flex-wrap gap-2">
                    {[0, 1].map((i) => (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <Skeleton className="size-18" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Other options */}
                <div className="space-y-3">
                  {[0, 1].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-28" />
                      <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-9 w-16" />
                        <Skeleton className="h-9 w-16" />
                        <Skeleton className="h-9 w-16" />
                        <Skeleton className="h-9 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Second section: Tabs and reviews */}
          <div className="space-y-4">
            {/* Tab triggers */}
            <div className="flex w-full gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <div className="flex-1" />
            </div>

            {/* Tab content - Details */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-10/12" />
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
