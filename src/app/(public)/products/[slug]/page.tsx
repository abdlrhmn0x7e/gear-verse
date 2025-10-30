import { Suspense } from "react";
import { ProductDetails } from "~/components/features/products/product-details";
import { Reviews } from "~/components/features/reviews";
import { app } from "~/server/application";

export async function generateStaticParams() {
  const slugs = await app.public.products.queries.findAllSlugs();

  return slugs;
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;

  return (
    <section className="py-24">
      <ProductDetails
        slug={slug}
        Reviews={({ productId }) => (
          <Suspense fallback={<div>Loading reviews...</div>}>
            <Reviews productId={productId} />
          </Suspense>
        )}
      />
    </section>
  );
}
