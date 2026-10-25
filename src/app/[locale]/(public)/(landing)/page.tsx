import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("landing.metadata");
  const title = t("title");

  return {
    title: { absolute: title },
    ...(await pageMetadata({
      title,
      description: t("description"),
      path: "/",
    })),
  };
}

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
