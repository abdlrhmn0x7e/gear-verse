import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import {
  ContainerIcon,
  CalendarIcon,
  FileTextIcon,
  ImageIcon,
  Package2Icon,
  ShoppingBagIcon,
} from "lucide-react";
import { HeaderSkeleton } from "~/app/admin/_components/header";

export default function Loading() {
  return (
    <section className="space-y-6">
      {/* Page Header Skeleton */}
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <HeaderSkeleton Icon={Package2Icon} />

        <div className="flex flex-col items-center gap-3 sm:items-end">
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
      </div>

      <div className="relative grid gap-6 sm:grid-cols-7">
        {/* Left Column - Photos and Listings */}
        <div className="h-fit space-y-6 sm:sticky sm:top-3 sm:col-span-3">
          {/* Product Photos Card */}
          <Card className="h-fit gap-3">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ImageIcon className="size-6" />
                <Skeleton className="h-6 w-36" />
              </div>
            </CardHeader>
            <CardContent>
              {/* Main carousel image skeleton */}
              <div className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-lg" />
                {/* Thumbnail navigation */}
                <div className="flex justify-center gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="size-16 rounded-md" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Listing Card */}
          <Card className="h-fit gap-3">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShoppingBagIcon className="size-6" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-10 w-32" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center gap-2 py-12">
                <ContainerIcon size={48} className="text-muted-foreground" />
                <Skeleton className="h-6 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Description */}
        <Card className="sm:col-span-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileTextIcon className="size-6" />
              <Skeleton className="h-6 w-40" />
            </div>
          </CardHeader>

          <CardContent>
            <div className="prose prose-leading-2 prose-pink m-auto space-y-4">
              {/* Simulating rich text content */}
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-6 w-4/5" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="h-6 w-2/3" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
