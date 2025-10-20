import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { ProductSkeleton } from "~/components/product";
import { Skeleton } from "~/components/ui/skeleton";

export default function ProductPageLoading() {
  return (
    <section className="py-24">
      <ProductSkeleton>
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
      </ProductSkeleton>
    </section>
  );
}
