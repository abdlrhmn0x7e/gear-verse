import type { Metadata } from "next";
import { pageMetadata } from "~/lib/seo/metadata";
import { TESTIMONIALS } from "~/components/features/testimonials/testimonials";
import { Brands } from "./_components/brands";
import { CategoryBento } from "./_components/category-bento";
import { ClosingCTA } from "./_components/closing-cta";
import { FAQ } from "./_components/faq";
import { Hero } from "./_components/hero";
import { HowItWorks } from "./_components/how-it-works";
import { MoreProducts } from "./_components/more-products";
import { Testimonials } from "./_components/testimonials";
import { TrustStrip } from "./_components/trust-strip";

const HOME_TITLE = "Gear Verse: Imported Gaming Keyboards, Mice & IEMs in Egypt";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  ...pageMetadata({
    title: HOME_TITLE,
    description:
      "Hand-imported gaming keyboards, mice, IEMs and webcams from AKKO, SIMGOT and more, customs cleared and delivered across Egypt. Prices in EGP, cash on delivery.",
    path: "/",
  }),
};

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <MoreProducts />
      <CategoryBento />
      <HowItWorks />
      <Brands />
      <Testimonials testimonials={TESTIMONIALS} />
      <FAQ />
      <ClosingCTA />
    </>
  );
}
