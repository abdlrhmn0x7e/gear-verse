import { Hero } from "./_components/hero";
import { ProblemSolutions } from "./_components/problem-solutions";
import { RecentProducts } from "./_components/recent-products";

export default function Home() {
  return (
    <>
      <Hero />
      <RecentProducts />
      <ProblemSolutions />
    </>
  );
}
