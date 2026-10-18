import {
  AwardIcon,
  PackageIcon,
  Undo2Icon,
  type LucideIcon,
} from "lucide-react";
import { cacheTag } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type JSX } from "react";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { WhatsAppNumberLink } from "~/components/whatsapp-number-link";
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
import { env } from "~/env";
import { findCategoryPath, getCategoryTree } from "~/lib/category-tree";
import { getStoreSettings } from "~/lib/store-settings";
import { cn } from "~/lib/utils";
import { tryCatch } from "~/lib/utils/try-catch";
import { app } from "~/server/application";
import { VariantSelectionStoreProvider } from "~/stores/variant-selection/provider";
import { PayOnDelivery } from "../payment/pay-on-delivery";
import { TrustPromisesPanel } from "../trust/trust-promises-panel";
import { ProductCard, type ProductCardItem } from "./product-card";
import { ProductGallery } from "./product-gallery";
import { ProductRow, ProductRowItem, StoreTile } from "./product-row";
import { ProductVariantSelector } from "./product-variant-selector";
import { PurchasePanel } from "./purchase-panel";

/** Condensed from the FAQ answers, so the product page repeats policies the store already states. */
const POLICY_ROWS: {
  value: string;
  icon: LucideIcon;
  title: string;
  body: string;
  link?: { href: string; label: string };
}[] = [
  {
    value: "delivery",
    icon: PackageIcon,
    title: "Delivery",
    body: "We deliver anywhere in Egypt. Most areas get their order in 1–2 business days, and you can check the estimate during checkout.",
  },
  {
    value: "authenticity",
    icon: AwardIcon,
    title: "Authenticity & warranty",
    body: "We only sell authentic gear from trusted brands, and most products come with the manufacturer's warranty.",
  },
  {
    value: "returns",
    icon: Undo2Icon,
    title: "Returns & refunds",
    body: "We refund a product only if it arrives defective or damaged, or has a problem caused by us. Report it within 24 hours of opening, with photos or videos of the problem. Once our team inspects it and approves the return, we collect the product and process your refund within 7 days.",
    link: { href: "/returns", label: "Read the full Returns & Refunds Policy" },
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

  // related products fill from the newest in the store, so a new product refreshes every page
  cacheTag(`products:${product.id}`, "recent-products");

  const hasVariants = product.variants.length > 0;
  const categoryPath = findCategoryPath(
    await getCategoryTree(),
    (node) => node.id === product.categoryId,
  );
  const category = categoryPath.at(-1);
  const { whatsappNumber } = await getStoreSettings();

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

            {!hideActions && whatsappNumber && (
              <p className="text-muted-foreground -mt-4 px-1 text-sm text-pretty">
                Questions? WhatsApp{" "}
                <WhatsAppNumberLink
                  number={whatsappNumber}
                  message={`Hi Gear Verse, I have a question about ${product.title}: ${new URL(`/products/${slug}`, env.NEXT_PUBLIC_APP_URL).href}`}
                  className="text-foreground font-medium tabular-nums underline decoration-from-font underline-offset-4"
                />
              </p>
            )}

            <PayOnDelivery className="px-1" />

            <Accordion type="single" collapsible className="border-t">
              {POLICY_ROWS.map((row) => (
                <AccordionItem key={row.value} value={row.value}>
                  <AccordionTrigger>
                    <span className="flex items-center gap-3">
                      <row.icon
                        className="text-muted-foreground size-5 shrink-0"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      {row.title}
                    </span>
                  </AccordionTrigger>
                  {/* the answer lines up with the title, past the icon */}
                  <AccordionContent className="pl-8">
                    <p>{row.body}</p>
                    {row.link && (
                      <p>
                        <Link
                          href={row.link.href}
                          className="text-foreground underline decoration-from-font underline-offset-4"
                        >
                          {row.link.label}
                        </Link>
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        <TrustPromisesPanel />

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

        {!hideActions && (
          <RelatedProducts
            productId={product.id}
            categorySlug={category?.slug}
          />
        )}
      </MaxWidthWrapper>
    </VariantSelectionStoreProvider>
  );
}

const RELATED_COUNT = 4;

/** Per related-product count: how many grid columns the store tile spans to finish the row (3 columns from md, 4 from xl).
 * With three products the md row is already full, so the tile only joins the row at xl. */
const STORE_TILE_SPAN: Record<number, string> = {
  1: "md:col-span-2 xl:col-span-3",
  2: "md:col-span-1 xl:col-span-2",
  3: "md:hidden xl:col-span-1 xl:block",
};

async function RelatedProducts({
  productId,
  categorySlug,
}: {
  productId: number;
  categorySlug: string | undefined;
}) {
  // same category first, then the newest from the rest of the store
  const [sameCategory, newest] = await Promise.all([
    categorySlug
      ? app.public.products.queries.getPage({
          pageSize: RELATED_COUNT + 1,
          filters: { categories: [categorySlug] },
        })
      : null,
    app.public.products.queries.getPage({ pageSize: RELATED_COUNT * 2 }),
  ]);
  const seen = new Set([productId]);
  const related: ProductCardItem[] = [];
  for (const item of [...(sameCategory?.data ?? []), ...newest.data]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    related.push(item);
  }
  related.splice(RELATED_COUNT);
  if (related.length === 0) return null;

  const tileSpan = STORE_TILE_SPAN[related.length];

  return (
    <section
      aria-labelledby="related-heading"
      className="space-y-10 border-t pt-12 md:pt-16"
    >
      <h2 id="related-heading" className="text-headline-sm text-balance">
        You might also like
      </h2>
      {/* a size container, so the spanning store tile can be exactly one card-image tall */}
      <ProductRow className="@container/related md:grid-cols-3 xl:grid-cols-4">
        {related.map((item) => (
          <ProductRowItem key={item.id}>
            <ProductCard
              product={item}
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 80vw"
            />
          </ProductRowItem>
        ))}

        {tileSpan && (
          <ProductRowItem className={tileSpan}>
            <StoreTile className="md:aspect-auto md:h-[calc((100cqw-3rem)/3)] xl:h-[calc((100cqw-4.5rem)/4)]" />
          </ProductRowItem>
        )}
      </ProductRow>
    </section>
  );
}
