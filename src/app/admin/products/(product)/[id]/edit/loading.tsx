import { PackageIcon, SaveIcon } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { HeaderSkeleton } from "~/components/header";

export default function Loading() {
  return (
    <section className="space-y-6">
      {/* Page Header Skeleton */}
      <HeaderSkeleton Icon={PackageIcon} />

      {/* Product Form Skeleton */}
      <div className="space-y-8">
        {/* Title Field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Category and Brand Fields (Grid) */}
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Images Dropzone */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Card className="border-2 border-dashed">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 text-center">
                  <Skeleton className="mx-auto h-4 w-48" />
                  <Skeleton className="mx-auto h-3 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-sm" />
            ))}
          </div>
        </div>

        {/* Description Editor */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Card>
            <CardContent className="p-0">
              {/* Editor Toolbar */}
              <div className="border-b p-3">
                <div className="flex items-center justify-center gap-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="size-6 rounded-sm" />
                  ))}
                </div>
              </div>

              {/* Editor Content Area */}
              <div className="space-y-3 p-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Save Button Skeleton */}
      <div className="fixed right-10 bottom-10">
        <div className="bg-background/80 rounded-md border px-4 py-2 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Button disabled>
              <SaveIcon size={16} />
              Save Product
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
