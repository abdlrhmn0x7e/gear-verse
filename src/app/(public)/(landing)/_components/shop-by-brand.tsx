import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Heading } from "~/components/heading";
import { BrandsCarousel, BrandsCarouselSkeleton } from "./brands-carousel";
import Glow from "~/components/ui/glow";
import { Suspense } from "react";
import { app } from "~/server/application";

export async function ShopByBrand() {
  const brands = await app.public.brands.queries.findAll();

  return (
    <section className="relative py-24">
      <MaxWidthWrapper className="space-y-8">
        <Heading level={1}>Shop By Brand</Heading>

        <Suspense fallback={<BrandsCarouselSkeleton />}>
          <BrandsCarousel brands={brands} />
        </Suspense>
      </MaxWidthWrapper>

      <Glow variant="below" />
    </section>
  );
}
