import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { api } from "~/trpc/server";
import { Filters } from "./_components/filters";
import { FiltersSkeleton } from "./_components/filters-skeleton";
import { Products } from "./_components/products";
import { loadAllProductSearchParams } from "./_components/hooks";

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  void loadAllProductSearchParams(searchParams);
  void api.user.categories.findAll.prefetch();
  void api.user.brands.findAll.prefetch();

  return (
    <>
      <MaxWidthWrapper className="relative grid grid-cols-1 gap-8 py-16 pt-24 lg:grid-cols-12 lg:pt-32">
        <Suspense
          fallback={<FiltersSkeleton className="lg:col-span-4 xl:col-span-3" />}
        >
          <Filters className="lg:col-span-4 xl:col-span-3" />
        </Suspense>
        <Products
          className="lg:col-span-8 xl:col-span-9"
          searchParams={searchParams}
        />
      </MaxWidthWrapper>
    </>
  );
}
