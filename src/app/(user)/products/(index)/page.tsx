import { Hero } from "./_components/hero";
import { Products } from "./_components/products";
import { Filters } from "./_components/filters";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import type { SearchParams } from "nuqs/server";

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    <>
      <Hero />
      <MaxWidthWrapper className="relative grid grid-cols-1 gap-8 py-16 lg:grid-cols-12">
        <Filters className="lg:col-span-4 xl:col-span-3" />
        <Products
          className="lg:col-span-8 xl:col-span-9"
          searchParams={searchParams}
        />
      </MaxWidthWrapper>
    </>
  );
}
