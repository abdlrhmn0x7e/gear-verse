import type { Metadata } from "next";
import { pageMetadata } from "~/lib/seo/metadata";
import { Brands } from "./_components/brands";
import { CategoryBento } from "./_components/category-bento";
import { FAQ } from "./_components/faq";
import { Hero } from "./_components/hero";
import { MoreProducts } from "./_components/more-products";
import { RequestSection } from "./_components/request-section";
import { Testimonials } from "./_components/testimonials";
import { TrustStrip } from "./_components/trust-strip";
import { WhyUs } from "./_components/why-us";

const HOME_TITLE = "Gear Verse: Gaming Keyboards, Mice & IEMs in Stock in Egypt";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  ...pageMetadata({
    title: HOME_TITLE,
    description:
      "A short list of gaming keyboards, mice and IEMs worth the money, from AKKO, SIMGOT and more. In stock in Egypt, delivered in 1–2 days, cash on delivery. Not on the shelf? Request it.",
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
      <WhyUs />
      <Testimonials />
      <FAQ />
      <RequestSection />
      <Brands />
    </>
  );
}
