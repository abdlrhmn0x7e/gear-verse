import { cacheTag } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type JSX } from "react";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { ProductDescription } from "~/components/product-description";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { findCategoryPath, getCategoryTree } from "~/lib/category-tree";
import { cn } from "~/lib/utils";
import { tryCatch } from "~/lib/utils/try-catch";
import { app } from "~/server/application";
import { VariantSelectionStoreProvider } from "~/stores/variant-selection/provider";
import { TRUST_PROMISES } from "../trust/trust-promises";
import {
  ProductCard,
  productGridClassName,
  type ProductCardItem,
} from "./product-card";
import { ProductGallery } from "./product-gallery";
import { ProductVariantSelector } from "./product-variant-selector";
import { PurchasePanel } from "./purchase-panel";

/** Condensed from the FAQ answers, so the product page repeats policies the store already states. */
const POLICY_ROWS = [
  {
    value: "delivery",
    title: "Delivery",
    body: "We deliver anywhere in Egypt. Most areas get their order in 1–2 business days, and you can check the estimate during checkout.",
  },
  {
    value: "authenticity",
    title: "Authenticity & warranty",
    body: "We only sell authentic gear from trusted brands, and most products come with the manufacturer's warranty.",
  },
  {
    value: "returns",
    title: "Returns & refunds",
    body: "Not happy with your order? Contact our support team to start a return or refund. If something arrives damaged or defective, send us photos and we'll replace it or refund you in full.",
  },
];

export async function ProductDetails({
  slug,
  className,
  Reviews,
  hideActions,
}: {
  slug: string;
  className?: string;
  Reviews?: (props: { productId: number }) => JSX.Element;
  /** admin preview: no buying, breadcrumb or related products */
  hideActions?: boolean;
}) {
  "use cache";

  const { data: product, error } = await tryCatch(
    app.public.products.queries.findBySlug(slug),
  );
  if (error) {
    return notFound();
  }

  cacheTag(`products:${product.id}`);

  const hasVariants = product.variants.length > 0;
  const categoryPath = findCategoryPath(
    await getCategoryTree(),
    (node) => node.id === product.categoryId,
  );
  const category = categoryPath.at(-1);

  return (
    <VariantSelectionStoreProvider>
      <MaxWidthWrapper className={cn("@container flex flex-col gap-8", className)}>
        {!hideActions && (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/products">Store</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {category && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href={`/categories/${category.slug}`}>
                        {category.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbPage className="truncate">
                  {product.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}

        <div className="grid gap-10 @4xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] @4xl:gap-16">
          <ProductGallery
            media={[product.thumbnailUrl, ...product.media]}
            title={product.title}
            variantCount={product.variants.length}
          />

          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              {product.brand.name && (
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <ImageWithFallback
                    src={product.brand.logoUrl}
                    alt=""
                    width={48}
                    height={48}
                    className="size-6 rounded-full border-none bg-white [&_img]:object-contain"
                  />
                  {product.brand.name}
                </div>
              )}
              <h1 className="text-headline-sm md:text-[2.5rem] md:leading-[1.1] text-balance">
                {product.title}
              </h1>
              {product.summary && (
                <p className="text-muted-foreground text-body-lg text-pretty">
                  {product.summary}
                </p>
              )}
            </div>

            {hasVariants && (
              <ProductVariantSelector variants={product.variants} />
            )}

            <PurchasePanel
              productId={product.id}
              productTitle={product.title}
              productStock={product.stock}
              hasVariants={hasVariants}
              price={product.price}
              strikeThroughPrice={product.strikeThroughPrice}
              showActions={!hideActions}
            />

            <ul className="flex flex-col gap-3 text-sm">
              {TRUST_PROMISES.map((promise) => (
                <li key={promise.title} className="flex items-start gap-3">
                  <promise.icon
                    className="mt-0.5 size-4 shrink-0"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span>
                    <span className="font-medium">{promise.title}.</span>{" "}
                    <span className="text-muted-foreground">
                      {promise.description}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <Accordion type="single" collapsible className="border-t">
              {POLICY_ROWS.map((row) => (
                <AccordionItem key={row.value} value={row.value}>
                  <AccordionTrigger>{row.title}</AccordionTrigger>
                  <AccordionContent>
                    <p>{row.body}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        <section
          aria-labelledby="details-heading"
          className="grid gap-8 border-t pt-12 md:pt-16 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] @4xl:gap-16"
        >
          <h2 id="details-heading" className="text-headline-sm text-balance">
            Details
          </h2>
          <Suspense>
            <ProductDescription description={product.description} />
          </Suspense>
        </section>

        {Reviews && (
          <div className="border-t pt-12 md:pt-16">
            <Reviews productId={product.id} />
          </div>
        )}

        {!hideActions && category && (
          <RelatedProducts
            productId={product.id}
            categorySlug={category.slug}
          />
        )}
      </MaxWidthWrapper>
    </VariantSelectionStoreProvider>
  );
}

async function RelatedProducts({
  productId,
  categorySlug,
}: {
  productId: number;
  categorySlug: string;
}) {
  const page = await app.public.products.queries.getPage({
    pageSize: 5,
    filters: { categories: [categorySlug] },
  });
  const related: ProductCardItem[] = page.data
    .filter((item) => item.id !== productId)
    .slice(0, 4);
  if (related.length === 0) return null;

  return (
    <section
      aria-labelledby="related-heading"
      className="space-y-10 border-t pt-12 md:pt-16"
    >
      <h2 id="related-heading" className="text-headline-sm text-balance">
        You might also like
      </h2>
      <div
        className={cn(productGridClassName, "lg:grid-cols-3 xl:grid-cols-4")}
      >
        {related.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  );
}
