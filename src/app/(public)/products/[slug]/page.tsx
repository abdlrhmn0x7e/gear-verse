import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductDetails } from "~/components/features/products/product-details";
import { Reviews } from "~/components/features/reviews";
import { app } from "~/server/application";

export async function generateStaticParams() {
  const slugs = await app.public.products.queries.findAllSlugs();
  console.log("Product slugs for static params:", slugs);
  if (slugs.length === 0) {
    return [{ slug: "__placeholder__" }];
  }

  return slugs;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "__placeholder__") {
    return notFound();
  }

  const metadata = await app.public.products.queries.findMetadata(slug);

  try {
    return {
      title: `Gear Verse | ${metadata.seo?.pageTitle ?? metadata.title}`,
      description: metadata.seo?.metaDescription ?? metadata.summary,
      openGraph: {
        title: metadata.seo?.pageTitle ?? metadata.title,
        description: metadata.seo?.metaDescription ?? metadata.summary,
        images: [metadata.thumbnailUrl],
      },

      twitter: {
        title: metadata.seo?.pageTitle ?? metadata.title,
        description: metadata.seo?.metaDescription ?? metadata.summary,
        images: [metadata.thumbnailUrl],
      },
    };
  } catch {
    return {
      title: "Gear Verse | Product Not Found",
      description: "The requested product could not be found.",
    };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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
