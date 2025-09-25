import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Heading } from "~/components/heading";
import { BrandsCarousel } from "./brands-carousel";
import Glow from "~/components/ui/glow";

export function ShopByBrand() {
  return (
    <section className="relative py-24">
      <MaxWidthWrapper className="space-y-8">
        <Heading level={1}>Shop By Brand</Heading>
        <BrandsCarousel />
      </MaxWidthWrapper>
      <Glow variant="below" />
    </section>
  );
}
