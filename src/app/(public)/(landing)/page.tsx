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
