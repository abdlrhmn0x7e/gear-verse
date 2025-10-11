import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Heading } from "~/components/heading";
import { BrandsCarousel, BrandsCarouselSkeleton } from "./brands-carousel";
import Glow from "~/components/ui/glow";
import { api } from "~/trpc/server";
import { Suspense } from "react";

export function ShopByBrand() {
  void api.public.brands.queries.findAll.prefetch();

  return (
    <section className="relative py-24">
      <MaxWidthWrapper className="space-y-8">
        <Heading level={1}>Shop By Brand</Heading>

        <Suspense fallback={<BrandsCarouselSkeleton />}>
          <BrandsCarousel />
        </Suspense>
      </MaxWidthWrapper>

      <Glow variant="below" />
    </section>
  );
}
