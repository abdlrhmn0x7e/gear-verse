import { CheckCircleIcon, InfoIcon, MessageCircleIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense, type JSX } from "react";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { ProductDescription } from "~/components/product-description";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "~/components/ui/frame";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { cn } from "~/lib/utils";
import { formatCurrency } from "~/lib/utils/format-currency";
import { tryCatch } from "~/lib/utils/try-catch";
import { app } from "~/server/application";
import { VariantSelectionStoreProvider } from "~/stores/variant-selection/provider";
import { AddToCartButton } from "./add-to-cart-button";
import { BuyNowButton } from "./buy-now-button";
import { ProductBrandBadge } from "./product-brand-badge";
import { ProductCarousel } from "./product-carousel";
import { ProductPrice } from "./product-price";
import { ProductVariantSelector } from "./product-variant-selector";
import { cacheTag } from "next/cache";

const WHY_US = [
  "1~2 Days Delivery",
  "100% Satisfaction Guarantee",
  "Customs Cleared & Insured",
  "Money Back Guarantee",
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

  const hasVariants = product.variants && product.variants.length > 0;
  console.log("Rendering ProductDetails for product:", product);

  return (
    <VariantSelectionStoreProvider>
      <MaxWidthWrapper
        className={cn("relative space-y-4 lg:grid lg:grid-cols-2", className)}
      >
        {/* Image Carousel Section */}
        <ProductCarousel media={product.media} brand={product.brand} />

        {/* Content Section */}
        <div className="space-y-6">
          <Frame className="w-full">
            <FrameHeader>
              <div className="flex items-center justify-between gap-2">
                <FrameTitle className="text-2xl font-bold">
                  {product.title}
                </FrameTitle>

                <ProductBrandBadge
                  brand={product.brand}
                  className="hidden lg:flex"
                />
              </div>
              <FrameDescription>{product.summary}</FrameDescription>
            </FrameHeader>

            <FramePanel>
              <h2 className="text-sm font-semibold">Pricing</h2>
              <div className="space-x-2 text-center lg:text-left">
                <ProductPrice originalPrice={product.price} />

                {product.strikeThroughPrice ? (
                  <span className="text-muted-foreground line-through">
                    {formatCurrency(product.strikeThroughPrice ?? 0)}
                  </span>
                ) : null}
              </div>
            </FramePanel>

            {hasVariants && (
              <FramePanel>
                <h2 className="text-sm font-semibold">Variants</h2>
                <ProductVariantSelector variants={product.variants} />
              </FramePanel>
            )}

            {!hasVariants && (
              <FramePanel>
                <h2 className="text-sm font-semibold">Why Us?</h2>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {WHY_US.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-sm font-medium"
                    >
                      <CheckCircleIcon className="size-4 text-green-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </FramePanel>
            )}

            {!hideActions && (
              <FramePanel>
                <div className="flex flex-col gap-2 lg:flex-row">
                  <AddToCartButton
                    className="peer w-full lg:flex-1"
                    size="lg"
                    variant="outline"
                    productId={product.id}
                  />

                  <BuyNowButton
                    className="peer-disabled:pointer-events-none peer-disabled:opacity-50"
                    product={product}
                  />
                </div>
              </FramePanel>
            )}
          </Frame>

          <Tabs defaultValue="details" className="space-y-4">
            <TabsList className="w-full">
              <TabsTrigger value="details">
                <InfoIcon />
                Details
              </TabsTrigger>
              {Reviews && (
                <TabsTrigger value="reviews">
                  <MessageCircleIcon />
                  Reviews
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="details">
              <Suspense>
                <ProductDescription
                  description={product.description}
                  className="m-0"
                />
              </Suspense>
            </TabsContent>

            {Reviews && (
              <TabsContent value="reviews">
                <Reviews productId={product.id} />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </MaxWidthWrapper>
    </VariantSelectionStoreProvider>
  );
}
