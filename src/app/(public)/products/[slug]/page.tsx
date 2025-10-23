import { ProductDetails } from "~/components/features/products/product-detailts";
import { app } from "~/server/application";

export async function generateStaticParams() {
  const slugs = await app.public.products.queries.findAllSlugs();

  return slugs;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <section className="py-24">
      <ProductDetails slug={slug} />
    </section>
  );
}
