import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { ProductsSkeleton } from "./_components/products";
import { Skeleton } from "~/components/ui/skeleton";

export default function LoadingCategoryProducts() {
  return (
    <MaxWidthWrapper className="relative grid min-h-screen grid-cols-1 gap-8 py-16 pt-24 lg:grid-cols-12 lg:pt-32">
      <aside className="sticky top-24 hidden size-full lg:col-span-4 lg:block xl:col-span-3">
        <Skeleton className="size-full" />
      </aside>

      <ProductsSkeleton className="lg:col-span-8 xl:col-span-9" />
    </MaxWidthWrapper>
  );
}
