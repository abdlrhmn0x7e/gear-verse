import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { ProductDetails } from "~/components/features/products/product-details";
import { Reviews } from "~/components/features/reviews";
import { requireAdmin } from "~/server/auth";

export const metadata: Metadata = {
  title: "Preview",
  robots: { index: false, follow: false },
};

// a blocking route, so the admin check finishes before anything streams and everyone else gets a real 404
export const instant = false;

export default async function ProductPreviewPage({
  params,
}: PageProps<"/[locale]/products/[slug]/preview">) {
  await requireAdmin();
  const { slug } = await params;
  const t = await getTranslations("products");

  return (
    <div className="pt-24 pb-12 md:pt-28">
      <ProductDetails
        slug={slug}
        preview
        Reviews={({ productId }) => (
          <Suspense
            fallback={
              <p className="text-muted-foreground">
                {t("details.loadingReviews")}
              </p>
            }
          >
            <Reviews productId={productId} />
          </Suspense>
        )}
      />
    </div>
  );
}
