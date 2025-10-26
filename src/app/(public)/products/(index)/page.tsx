import type { SearchParams } from "nuqs/server";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Filters } from "./_components/filters";
import { Products, ProductsSkeleton } from "./_components/products";
import { Suspense } from "react";
import { ProductListSkeleton } from "./_components/product-list";

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <MaxWidthWrapper className="relative grid min-h-screen grid-cols-1 gap-8 py-16 pt-24 lg:grid-cols-12 lg:pt-32">
      <div className="hidden lg:col-span-4 lg:block xl:col-span-3">
        <Suspense>
          <Filters />
        </Suspense>
      </div>

      {/* <ProductListSkeleton /> */}

      <Suspense fallback={<ProductsSkeleton />}>
        <Products
          className="lg:col-span-8 xl:col-span-9"
          searchParams={searchParams}
        />
      </Suspense>
    </MaxWidthWrapper>
  );
}
