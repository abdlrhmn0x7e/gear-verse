import {
  AwardIcon,
  EyeIcon,
  PackageIcon,
  Undo2Icon,
  type LucideIcon,
} from "lucide-react";
import { cacheTag } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "~/i18n/navigation";
import { notFound } from "next/navigation";
import { Fragment, Suspense, type JSX, type ReactNode } from "react";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { WhatsAppNumberLink } from "~/components/whatsapp-number-link";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
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
import { localizedCopyProps } from "~/lib/arabic";
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

const inlineLinkClassName =
  "text-foreground underline decoration-from-font underline-offset-4";

/**
 * Condensed from the FAQ answers, so the product page repeats policies the
 * store already states. With a WhatsApp number, the returns row says where to
 * report a problem.
 */
function policyRows(
  whatsappNumber: string | null,
  reportIssueMessage: string,
  t: Awaited<ReturnType<typeof getTranslations<"products.policies">>>,
): {
  value: string;
  icon: LucideIcon;
  title: string;
  body: ReactNode;
  link?: { href: string; label: string };
}[] {
  return [
    {
      value: "delivery",
      icon: PackageIcon,
      title: t("deliveryTitle"),
      body: t("deliveryBody"),
    },
    {
      value: "authenticity",
      icon: AwardIcon,
      title: t("authenticityTitle"),
      body: t("authenticityBody"),
    },
    {
      value: "returns",
      icon: Undo2Icon,
      title: t("returnsTitle"),
      body: t.rich("returnsBody", {
        hasWhatsApp: String(Boolean(whatsappNumber)),
        link: () =>
          whatsappNumber && (
            <WhatsAppNumberLink
              number={whatsappNumber}
              message={reportIssueMessage}
              className={`${inlineLinkClassName} tabular-nums`}
            />
          ),
      }),
      link: {
        href: "/returns",
        label: t("returnsLink"),
      },
    },
  ];
}

export async function ProductDetails({
  slug,
  className,
  Reviews,
  preview,
}: {
  slug: string;
  className?: string;
  Reviews?: (props: { productId: number }) => JSX.Element;
  /** The admin preview: drafts render too, without the buying controls. */
  preview?: boolean;
}) {
  "use cache";

  const locale = await getLocale();
  const { data: product, error } = await tryCatch(
    app.public.products.queries.findBySlug(slug, locale, preview),
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
  const [{ whatsappNumber }, t, tPolicies, tWhatsApp] = await Promise.all([
    getStoreSettings(),
    getTranslations("products"),
    getTranslations("products.policies"),
    getTranslations("common.whatsapp"),
  ]);

  return (
    <VariantSelectionStoreProvider>
      <MaxWidthWrapper
        className={cn("@container flex flex-col gap-8", className)}
      >
        {preview && (
          <Alert role="note">
            <EyeIcon />
            <AlertTitle>Preview. Only admins can see this page.</AlertTitle>
            {!product.published && (
              <AlertDescription>
                This product is a draft. Customers can&apos;t see it until you
                publish it.
              </AlertDescription>
            )}
          </Alert>
        )}

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/products" />}>
                {t("breadcrumbStore")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {/* the whole path, root first, not just the leaf category */}
            {categoryPath.map((node) => (
              <Fragment key={node.id}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink
                    render={<Link href={`/categories/${node.slug}`} />}
                  >
                    <bdi {...localizedCopyProps(locale, node.fallback?.name)}>
                      {node.name}
                    </bdi>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </Fragment>
            ))}
            <BreadcrumbSeparator />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage dir="auto" className="truncate">
                {product.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid gap-10 @4xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] @4xl:gap-16">
          <ProductGallery
            media={[product.thumbnailUrl, ...product.media]}
            // a single variant is the product itself, so its photo adds nothing
            variantPhotos={
              product.variants.length > 1
                ? product.variants.map((variant) => variant.thumbnailUrl ?? "")
                : []
            }
            title={product.title}
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
                    className="size-6 rounded-full border-none bg-white"
                  />
                  <bdi>{product.brand.name}</bdi>
                </div>
              )}
              {/* titles and summaries are stored in English; isolated so their punctuation stays put in Arabic */}
              <h1 className="text-headline-sm text-balance md:text-[2.5rem] md:leading-[1.1]">
                <bdi>{product.title}</bdi>
              </h1>
              {/* Google wants a used or refurbished item's condition on the page too */}
              {product.condition !== "NEW" && (
                <Badge variant="secondary">
                  {product.condition === "USED"
                    ? t("details.used")
                    : t("details.refurbished")}
                </Badge>
              )}
              {product.summary && (
                <p
                  dir="auto"
                  className="text-muted-foreground text-body-lg text-pretty"
                  {...localizedCopyProps(locale, product.fallback.summary)}
                >
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
              allowBackorder={product.allowBackorder}
              hasVariants={hasVariants}
              price={product.price}
              strikeThroughPrice={product.strikeThroughPrice}
              showActions={!preview}
            />

            {!preview && whatsappNumber && (
              <p className="text-muted-foreground -mt-4 px-1 text-sm text-pretty">
                {t.rich("details.questions", {
                  link: () => (
                    <WhatsAppNumberLink
                      number={whatsappNumber}
                      message={t("details.questionMessage", {
                        title: product.title,
                        url: new URL(
                          `/products/${slug}`,
                          env.NEXT_PUBLIC_APP_URL,
                        ).href,
                      })}
                      className="text-foreground font-medium tabular-nums underline decoration-from-font underline-offset-4"
                    />
                  ),
                })}
              </p>
            )}

            <PayOnDelivery className="px-1" />

            <Accordion className="border-t">
              {policyRows(
                whatsappNumber,
                tWhatsApp("reportIssue"),
                tPolicies,
              ).map((row) => (
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
                  <AccordionContent className="ps-8">
                    <p>{row.body}</p>
                    {row.link && (
                      <p>
                        <Link
                          href={row.link.href}
                          className={inlineLinkClassName}
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
            {t("details.heading")}
          </h2>
          <Suspense>
            <ProductDescription
              description={product.description}
              english={product.fallback.description}
            />
          </Suspense>
        </section>

        {Reviews && (
          <div className="border-t pt-12 md:pt-16">
            <Reviews productId={product.id} />
          </div>
        )}

        <RelatedProducts productId={product.id} categorySlug={category?.slug} />
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
  const locale = await getLocale();
  const [sameCategory, newest] = await Promise.all([
    categorySlug
      ? app.public.products.queries.getPage({
          pageSize: RELATED_COUNT + 1,
          filters: { categories: [categorySlug] },
          locale,
        })
      : null,
    app.public.products.queries.getPage({
      pageSize: RELATED_COUNT * 2,
      locale,
    }),
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
  const t = await getTranslations("products.details");

  return (
    <section
      aria-labelledby="related-heading"
      className="space-y-10 border-t pt-12 md:pt-16"
    >
      <h2 id="related-heading" className="text-headline-sm text-balance">
        {t("related")}
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
