import {
  ArrowRightIcon,
  CircleAlertIcon,
  CircleXIcon,
  PackageXIcon,
  StarIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { ProductDescription } from "~/components/product-description";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DrawerBody,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { getDiscountPercentage } from "~/components/features/products/product-card";
import { findCategoryPath, getCategoryTree } from "~/lib/category-tree";
import { getStoreSettings } from "~/lib/store-settings";
import { cn } from "~/lib/utils";
import { formatCurrency } from "~/lib/utils/format-currency";
import { isAppError } from "~/lib/errors/app-error";
import { tryCatch } from "~/lib/utils/try-catch";
import { app } from "~/server/application";
import { api } from "~/trpc/server";
import { ProductSummaryActions } from "./product-summary-actions";
import { ProductSummaryGallery } from "./product-summary-gallery";
import { Reviews } from "./reviews";

type StockLevel = "out" | "low" | "ok";

function stockLevel(quantity: number, lowStockThreshold: number): StockLevel {
  if (quantity <= 0) return "out";
  if (quantity <= lowStockThreshold) return "low";
  return "ok";
}

export async function ProductSummary({ slug }: { slug: string }) {
  const { data: product, error } = await tryCatch(
    app.admin.products.queries.findSummaryBySlug(slug),
  );
  if (error) {
    if (isAppError(error) && error.kind === "NOT_FOUND") {
      return <ProductNotFound />;
    }
    throw error;
  }

  const [stats, reviews, categoryTree, { lowStockThreshold }] =
    await Promise.all([
      api.admin.products.queries.getSalesStats({ id: product.id }),
      api.admin.reviews.queries.findAll({ productId: product.id }),
      getCategoryTree(),
      getStoreSettings(),
    ]);

  const categoryPath = findCategoryPath(
    categoryTree,
    (node) => node.id === product.categoryId,
  );
  const photos = [product.thumbnailUrl, ...product.media].filter(Boolean);
  const discount = getDiscountPercentage(
    product.price,
    product.strikeThroughPrice,
  );

  const hasVariants = product.variants.length > 0;
  const stockRows = hasVariants
    ? product.variants.map((variant) => ({
        key: variant.id,
        label: Object.values(variant.options)
          .map((option) => option.value)
          .join(" / "),
        thumbnailUrl: variant.thumbnailUrl,
        price: variant.overridePrice,
        quantity: variant.stock ?? 0,
      }))
    : [
        {
          key: 0,
          label: "Units in stock",
          thumbnailUrl: null,
          price: null,
          quantity: product.stock ?? 0,
        },
      ];
  const totalStock = stockRows.reduce((sum, row) => sum + row.quantity, 0);
  const outCount = stockRows.filter(
    (row) => stockLevel(row.quantity, lowStockThreshold) === "out",
  ).length;
  const lowCount = stockRows.filter(
    (row) => stockLevel(row.quantity, lowStockThreshold) === "low",
  ).length;

  const variantPrices = product.variants.map(
    (variant) => variant.overridePrice ?? product.price,
  );
  const minPrice = Math.min(product.price, ...variantPrices);
  const maxPrice = Math.max(product.price, ...variantPrices);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;

  return (
    <>
      <DrawerHeader className="flex-row items-start gap-4 text-start group-data-[vaul-drawer-direction=bottom]/drawer-content:text-start">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {product.published ? (
              <Badge variant="success">Published</Badge>
            ) : (
              <Badge variant="outline">Draft</Badge>
            )}
            {!hasVariants && outCount > 0 ? (
              <Badge variant="error">
                <CircleXIcon />
                Out of stock
              </Badge>
            ) : outCount > 0 ? (
              <Badge variant="error">
                <CircleXIcon />
                {outCount} out of stock
              </Badge>
            ) : null}
            {lowCount > 0 && (
              <Badge variant="warning">
                <CircleAlertIcon />
                {hasVariants ? `${lowCount} low on stock` : "Low on stock"}
              </Badge>
            )}
          </div>

          <DrawerTitle className="text-xl leading-snug font-medium text-balance">
            {product.title}
          </DrawerTitle>

          {/* a div, since the brand logo renders block elements a <p> can't hold */}
          <DrawerDescription
            className="flex flex-wrap items-center gap-x-2 gap-y-1"
            asChild
          >
            <div>
              {product.brand.name && (
                <span className="text-foreground flex items-center gap-1.5">
                  <ImageWithFallback
                    src={product.brand.logoUrl}
                    alt=""
                    width={40}
                    height={40}
                    className="size-5 rounded-full border-none bg-white [&_img]:object-contain"
                  />
                  {product.brand.name}
                </span>
              )}
              {product.brand.name && categoryPath.length > 0 && (
                <span aria-hidden>·</span>
              )}
              {categoryPath.length > 0 && (
                <span>{categoryPath.map((node) => node.name).join(" › ")}</span>
              )}
            </div>
          </DrawerDescription>
        </div>

        <DrawerClose asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close"
            className="-me-2 -mt-1"
          >
            <XIcon />
          </Button>
        </DrawerClose>
      </DrawerHeader>

      <DrawerBody className="flex flex-col gap-10">
        <ProductSummaryGallery photos={photos} title={product.title} />

        <section aria-label="Pricing" className="flex flex-col gap-2">
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 tabular-nums">
            <span className="text-3xl font-medium tracking-tight">
              {formatCurrency(product.price)}
            </span>
            {discount > 0 && (
              <>
                <s className="text-muted-foreground text-lg">
                  <span className="sr-only">Was </span>
                  {formatCurrency(product.strikeThroughPrice!)}
                </s>
                <Badge variant="brand" className="self-center">
                  Save {discount}%
                </Badge>
              </>
            )}
          </p>
          {minPrice !== maxPrice && (
            <p className="text-muted-foreground text-sm tabular-nums">
              Variants sell for {formatCurrency(minPrice)} to{" "}
              {formatCurrency(maxPrice)}
            </p>
          )}
          {product.summary && (
            <p className="text-muted-foreground mt-2 text-pretty">
              {product.summary}
            </p>
          )}
        </section>

        <Section
          title="Performance"
          caption="All time, leaving out cancelled and refunded orders"
        >
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Units sold" value={stats.unitsSold.toLocaleString()} />
            <Stat label="Revenue" value={formatCurrency(stats.revenue)} />
            <Stat label="Orders" value={stats.orders.toLocaleString()} />
            <Stat
              label="Rating"
              value={
                averageRating === null ? (
                  <span className="text-muted-foreground">None yet</span>
                ) : (
                  <span className="flex items-center gap-1">
                    {averageRating.toFixed(1)}
                    <StarIcon
                      aria-hidden
                      className="fill-foreground size-4"
                      strokeWidth={1.5}
                    />
                    <span className="text-muted-foreground text-sm font-normal">
                      ({reviews.length})
                    </span>
                  </span>
                )
              }
            />
          </dl>
        </Section>

        <Section
          title="Stock"
          caption={
            hasVariants
              ? `${totalStock.toLocaleString()} units across ${stockRows.length} variants`
              : undefined
          }
          action={
            <Button variant="ghost" size="sm" className="-me-3" asChild>
              <Link
                href={`/admin/inventory?inventorySearch=${encodeURIComponent(product.title)}`}
              >
                Manage inventory
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          }
        >
          <ul className="bg-input-background divide-y rounded-2xl">
            {stockRows.map((row) => {
              const level = stockLevel(row.quantity, lowStockThreshold);
              return (
                <li key={row.key} className="flex items-center gap-3 p-3">
                  {hasVariants && (
                    <div className="image-well size-11 shrink-0 overflow-hidden rounded-xl">
                      <ImageWithFallback
                        src={row.thumbnailUrl ?? product.thumbnailUrl}
                        alt=""
                        width={88}
                        height={88}
                        className="size-full rounded-none border-none bg-transparent p-1 [&_img]:object-contain"
                      />
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium">{row.label}</span>
                    {row.price !== null && row.price !== product.price && (
                      <span className="text-muted-foreground text-sm tabular-nums">
                        {formatCurrency(row.price)}
                      </span>
                    )}
                  </div>
                  {level === "out" && (
                    <Badge variant="error">Out of stock</Badge>
                  )}
                  {level === "low" && <Badge variant="warning">Low</Badge>}
                  <span
                    className={cn(
                      "min-w-8 text-end font-medium tabular-nums",
                      level === "out" && "text-muted-foreground",
                    )}
                  >
                    {row.quantity.toLocaleString()}
                  </span>
                </li>
              );
            })}
          </ul>
        </Section>

        <Accordion type="single" collapsible className="-my-5">
          <AccordionItem value="description" className="border-b-0">
            <AccordionTrigger>Description</AccordionTrigger>
            <AccordionContent className="text-foreground">
              <Suspense>
                <ProductDescription
                  description={product.description}
                  className="m-0"
                />
              </Suspense>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Section
          title="Reviews"
          caption={
            reviews.length > 0
              ? `${reviews.length.toLocaleString()} ${reviews.length === 1 ? "review" : "reviews"}`
              : undefined
          }
        >
          <Reviews reviews={reviews} />
        </Section>
      </DrawerBody>

      <DrawerFooter className="flex-row flex-wrap items-center gap-2">
        <ProductSummaryActions
          id={product.id}
          slug={slug}
          published={product.published}
        />
      </DrawerFooter>
    </>
  );
}

function Section({
  title,
  caption,
  action,
  children,
}: {
  title: string;
  caption?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base font-medium">{title}</h3>
          {caption && (
            <p className="text-muted-foreground text-sm text-pretty">
              {caption}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="bg-input-background flex flex-col gap-1 rounded-2xl p-4">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="text-lg font-medium tabular-nums">{value}</dd>
    </div>
  );
}

function ProductNotFound() {
  return (
    <>
      <DrawerHeader>
        <DrawerTitle className="sr-only">Product not found</DrawerTitle>
        <DrawerDescription className="sr-only">
          This product no longer exists.
        </DrawerDescription>
      </DrawerHeader>
      <DrawerBody className="flex items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageXIcon />
            </EmptyMedia>
            <EmptyTitle>Product not found</EmptyTitle>
            <EmptyDescription>
              It may have been deleted. Close this panel to go back to the list.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </DrawerBody>
    </>
  );
}
