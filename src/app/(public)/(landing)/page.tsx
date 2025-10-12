import { CTA } from "./_components/cta";
import { FAQ } from "./_components/faq";
import { Hero } from "./_components/hero";
import { ProblemSolutions } from "./_components/problem-solutions";
import { RecentProducts } from "./_components/recent-products";
import { ShopByBrand } from "./_components/shop-by-brand";

// FIX: the hydrate client is not working unless the page is dynamic
// export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Hero />

      <div className="via-background absolute -inset-x-0 -bottom-24 -z-10 h-64 bg-gradient-to-b from-transparent from-0% via-50% to-transparent to-100%" />

      <RecentProducts />
      <ProblemSolutions />
      <ShopByBrand />
      <FAQ />
      <CTA />
    </>
  );
}
