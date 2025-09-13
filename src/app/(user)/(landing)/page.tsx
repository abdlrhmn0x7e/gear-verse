import { CTA } from "./_components/cta";
import { FAQ } from "./_components/faq";
import { Hero } from "./_components/hero";
import { ProblemSolutions } from "./_components/problem-solutions";
import { RecentProducts } from "./_components/recent-products";
import { ShopByBrand } from "./_components/shop-by-brand";

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
