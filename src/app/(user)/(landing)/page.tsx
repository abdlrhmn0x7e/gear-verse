import { CTA } from "./_components/cta";
import { FAQ } from "./_components/faq";
import { Hero } from "./_components/hero";
import { ProblemSolutions } from "./_components/problem-solutions";
import { RecentProducts } from "./_components/recent-products";
import { ShopByBrand } from "./_components/shop-by-brand";

// FIX: the hydrate client is not working unless the page is dynamic
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Hero />
      <RecentProducts />
      <ProblemSolutions />
      <ShopByBrand />
      <FAQ />
      <CTA />
    </>
  );
}
