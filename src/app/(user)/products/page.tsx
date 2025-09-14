import { Hero } from "./_components/hero";
import { Products } from "./_components/products";
import { Filters } from "./_components/filters";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";

export default function ProductsPage() {
  return (
    <>
      <Hero />
      <MaxWidthWrapper className="grid grid-cols-1 gap-8 py-16 md:grid-cols-3">
        <Filters className="col-span-1" />
        <Products className="col-span-2" />
      </MaxWidthWrapper>
    </>
  );
}
