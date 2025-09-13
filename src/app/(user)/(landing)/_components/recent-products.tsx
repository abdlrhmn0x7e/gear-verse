import { Heading } from "~/components/heading";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { api, HydrateClient } from "~/trpc/server";
import { ProductsCarousel } from "./products-carousel";
import Glow from "~/components/ui/glow";

export function RecentProducts() {
  void api.user.products.getPage.prefetchInfinite({
    pageSize: 10,
  });

  return (
    <section className="relative py-24">
      <MaxWidthWrapper className="space-y-12">
        <div>
          <Heading level={1}>Our Latest Rare Gear Collection</Heading>
          <p className="text-muted-foreground text-lg">
            {
              "Gaming gear choices are limited in Egypt. We're here to change that. Take a look at our latest collection."
            }
          </p>
        </div>
        <HydrateClient>
          <ProductsCarousel />
        </HydrateClient>
      </MaxWidthWrapper>
      <Glow variant="center" />
    </section>
  );
}
