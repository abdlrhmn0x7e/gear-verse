import type { Metadata } from "next";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductDetails } from "~/components/features/products/product-details";
import { Reviews } from "~/components/features/reviews";
import { findCategoryPath, getCategoryTree } from "~/lib/category-tree";
import { isAppError } from "~/lib/errors/app-error";
import { JsonLd } from "~/lib/seo/json-ld";
import { pageMetadata } from "~/lib/seo/metadata";
import { productMetaDescription } from "~/lib/seo/product";
import {
  breadcrumbJsonLd,
  categoryTrail,
  productJsonLd,
} from "~/lib/seo/structured-data";
import { tryCatch } from "~/lib/utils/try-catch";
import { app } from "~/server/application";

/**
 * Null for unpublished, archived and unknown slugs. The miss is told apart
 * here, inside the cache scope, because errors thrown out of `use cache` lose
 * their class in production, so the caller can't tell a 404 from a 500.
 */
async function findProductMetadata(slug: string) {
  "use cache";

  const { data: metadata, error } = await tryCatch(
    app.public.products.queries.findMetadata(slug),
  );
  if (error) {
    if (isAppError(error) && error.kind === "NOT_FOUND") {
      // publishing a product invalidates "sitemap", which clears this miss
      cacheTag("sitemap");
      return null;
    }
    throw error;
  }

  cacheTag(`products:${metadata.id}`);
  return metadata;
}

export async function generateStaticParams() {
  const slugs = await app.public.products.queries.findAllSlugs();
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

  // unpublished, archived and unknown products are a 404, not a 500
  const metadata = await findProductMetadata(slug);
  if (!metadata) {
    notFound();
  }

  const title = metadata.seo?.pageTitle ?? `${metadata.title}: Price in Egypt`;
  const description =
    metadata.seo?.metaDescription ??
    productMetaDescription({
      title: metadata.title,
      brand: metadata.brand?.name ?? null,
      price: metadata.price,
      summary: metadata.summary,
    });

  return {
    title,
    ...pageMetadata({
      title,
      description,
      path: `/products/${metadata.slug}`,
      images: [...new Set([metadata.thumbnailUrl, ...metadata.media])].filter(
        Boolean,
      ),
    }),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // checked before anything streams, so the response is a real 404
  const product =
    slug === "__placeholder__" ? null : await findProductMetadata(slug);
  if (!product) {
    notFound();
  }

  const categoryPath = findCategoryPath(
    await getCategoryTree(),
    (node) => node.id === product.categoryId,
  );

  return (
    <div className="pt-24 pb-12 md:pt-28">
      {/* here and not in ProductDetails, which the admin preview renders too */}
      <JsonLd data={productJsonLd({ product, categoryPath })} />
      <JsonLd
        data={breadcrumbJsonLd([
          ...categoryTrail(categoryPath),
          { name: product.title, path: `/products/${product.slug}` },
        ])}
      />
      <ProductDetails
        slug={slug}
        Reviews={({ productId }) => (
          <Suspense fallback={<p className="text-muted-foreground">Loading reviews…</p>}>
            <Reviews productId={productId} />
          </Suspense>
        )}
      />
    </div>
  );
}
