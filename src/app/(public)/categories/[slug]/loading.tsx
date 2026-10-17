import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Skeleton } from "~/components/ui/skeleton";
import { ProductsSkeleton } from "./_components/products";

export default function LoadingCategoryProducts() {
  return (
    <MaxWidthWrapper className="pt-28 pb-12 md:pt-36">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="mt-4 h-6 w-96 max-w-full" />
      <Skeleton className="mt-8 h-10 w-full max-w-xl rounded-full" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
        <Skeleton className="hidden h-96 lg:block" />
        <ProductsSkeleton />
      </div>
    </MaxWidthWrapper>
  );
}
