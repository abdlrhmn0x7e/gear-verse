"use client";

import { type PropsWithChildren, useEffect, useMemo } from "react";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Badge } from "~/components/ui/badge";
import { VerseCarousel } from "~/components/verse-carousel";
import type { RouterOutputs } from "~/trpc/react";
import { formatCurrency } from "~/lib/utils/format-currency";
import { VariantButton } from "~/components/variant-button";
import { cn } from "~/lib/utils";
import { BuyNowButton } from "../app/(public)/products/[slug]/_components/buy-now-button";
import { XIcon, CheckCircleIcon, AlertTriangleIcon } from "lucide-react";
import { AddToCartButton } from "./add-to-cart-button";
import { api } from "~/trpc/react";
import { StarRating } from "../app/(public)/products/[slug]/_components/star-rating";
import { Button } from "~/components/ui/button";
import { useVariantSelectionStore } from "~/stores/variant-selection/provider";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "~/components/ui/frame";
import { Skeleton } from "~/components/ui/skeleton";

type Product = RouterOutputs["public"]["products"]["queries"]["findBySlug"];

const WHY_US = [
  "1~2 Days Delivery",
  "100% Satisfaction Guarantee",
  "Customs Cleared & Insured",
  "Money Back Guarantee",
];

export function Product({
  children,
  product,
  className,
  hideActions,
}: PropsWithChildren<{
  product: Product;
  className?: string;
  hideActions?: boolean;
}>) {
  const { data: reviews } = api.public.reviews.findAll.useQuery({
    productId: product.id,
  });

  const options = product.options ?? [];
  const variants = useMemo(() => product.variants ?? [], [product.variants]);
  const hasVariants = variants.length > 0;
  const hasOptionsAndVariants = options.length > 0 && hasVariants;

  // Store hooks
  const variantId = useVariantSelectionStore((state) => state.variantId);
  const selectedOptions = useVariantSelectionStore(
    (state) => state.selectedOptions,
  );
  const updateSelectedOption = useVariantSelectionStore(
    (state) => state.updateSelectedOption,
  );
  const setVariantSelection = useVariantSelectionStore(
    (state) => state.setVariantSelection,
  );

  const selectedVariant = useMemo(() => {
    if (!hasVariants) {
      return null;
    }

    if (Object.keys(selectedOptions).length > 0) {
      const byOptions = variants.find((variant) =>
        Object.entries(selectedOptions).every(
          ([name, value]) => variant.optionValues[name] === value,
        ),
      );
      if (byOptions) {
        return byOptions;
      }
    }

    if (variantId) {
      const byId = variants.find((variant) => variant.id === variantId);
      if (byId) {
        return byId;
      }
    }

    return variants[0] ?? null;
  }, [hasVariants, selectedOptions, variantId, variants]);

  useEffect(() => {
    if (!hasVariants) {
      if (variantId !== null || Object.keys(selectedOptions).length > 0) {
        setVariantSelection(null);
      }
      return;
    }

    const byOptions = Object.keys(selectedOptions).length
      ? variants.find((variant) =>
          Object.entries(selectedOptions).every(
            ([name, value]) => variant.optionValues[name] === value,
          ),
        )
      : null;

    const byId = variantId
      ? variants.find((variant) => variant.id === variantId)
      : null;

    const resolved = byOptions ?? byId ?? variants[0] ?? null;

    if (!resolved) {
      return;
    }

    const optionValues = resolved.optionValues ?? {};

    const optionsMatch = Object.entries(optionValues).every(
      ([name, value]) => selectedOptions[name] === value,
    );

    if (variantId !== resolved.id || !optionsMatch) {
      setVariantSelection(resolved);
    }
  }, [hasVariants, setVariantSelection, selectedOptions, variantId, variants]);

  const stock = useMemo(() => {
    if (selectedVariant) {
      return selectedVariant.stock;
    }

    if (product.stock !== undefined && product.stock !== null) {
      return product.stock;
    }

    return 0;
  }, [product.stock, selectedVariant]);

  return (
    <MaxWidthWrapper
      className={cn("relative space-y-4 lg:grid lg:grid-cols-2", className)}
    >
      {/* Image Carousel Section */}
      <div className="h-fit lg:sticky lg:top-24">
        <VerseCarousel
          photos={
            selectedVariant
              ? [selectedVariant.thumbnailUrl, ...product.media]
              : product.media
          }
          className="mx-auto lg:max-w-4/5"
        />

        <ProductBrandBadge
          brand={product.brand}
          stock={stock}
          className="absolute top-2 right-6 z-10 md:right-14 lg:hidden"
        />
      </div>

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
                stock={stock}
                className="hidden lg:flex"
              />
            </div>
            <FrameDescription>{product.summary}</FrameDescription>
          </FrameHeader>

          <FramePanel>
            <h2 className="text-sm font-semibold">Pricing</h2>
            <div className="space-x-2 text-center lg:text-left">
              <span className="text-primary dark:text-primary-foreground text-3xl font-bold lg:text-4xl">
                {formatCurrency(
                  selectedVariant?.overridePrice === 0 ||
                    !selectedVariant?.overridePrice
                    ? product.price
                    : selectedVariant.overridePrice,
                )}
              </span>

              {product.strikeThroughPrice && (
                <span className="text-muted-foreground line-through">
                  {formatCurrency(product.strikeThroughPrice ?? 0)}
                </span>
              )}
            </div>

            {reviews && reviews.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <StarRating
                  rating={
                    (reviews?.reduce((acc, review) => acc + review.rating, 0) ??
                      0) / (reviews?.length ?? 0)
                  }
                />
                ({reviews?.length ?? 0} reviews)
              </div>
            )}
          </FramePanel>

          {hasOptionsAndVariants && selectedVariant && (
            <FramePanel>
              <h2 className="text-sm font-semibold">Variants</h2>
              <VariantSelector
                product={product}
                onSelectOption={(name, value) =>
                  updateSelectedOption(name, value, variants)
                }
                selectedOptions={selectedOptions}
                selectedVariant={selectedVariant}
              />
            </FramePanel>
          )}

          {!hasOptionsAndVariants && (
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
                  stock={stock}
                />

                <BuyNowButton
                  className="peer-disabled:pointer-events-none peer-disabled:opacity-50"
                  product={product}
                />
              </div>
            </FramePanel>
          )}
        </Frame>

        {children}
      </div>
    </MaxWidthWrapper>
  );
}

interface VariantSelectorProps {
  product: Product;
  selectedOptions: Record<string, string>;
  onSelectOption: (name: string, value: string) => void;
  selectedVariant: NonNullable<Product["variants"]>[number];
}

function VariantSelector({
  product,
  selectedOptions,
  onSelectOption,
}: VariantSelectorProps) {
  const options = product.options ?? [];
  const variants = product.variants ?? [];
  const firstOption = options[0];
  const otherOptions = options.slice(1);

  const getVariantMatchingPartial = (partial: Record<string, string>) =>
    variants.find((v) =>
      Object.entries(partial).every(
        ([name, value]) => v.optionValues[name] === value,
      ),
    );

  const getRepresentativeVariantForFirstValue = (value: string) => {
    if (!firstOption) {
      return variants[0]!;
    }

    const partial: Record<string, string> = { [firstOption.name]: value };

    for (const opt of otherOptions) {
      const selected = selectedOptions[opt.name];
      if (selected) {
        partial[opt.name] = selected;
      }
    }

    return (
      getVariantMatchingPartial(partial) ??
      variants.find((v) => v.optionValues[firstOption.name] === value) ??
      variants[0]!
    );
  };

  return (
    <div className="space-y-3">
      {/* First Option - with visual variant buttons */}
      {firstOption && (
        <div className="space-y-3">
          <p className="text-foreground/80 text-lg font-semibold capitalize">
            {firstOption.name}
          </p>

          <div className="flex flex-wrap gap-2">
            {firstOption.values.map((val, index) => {
              const representative = getRepresentativeVariantForFirstValue(
                val.value,
              );
              const isSelected =
                selectedOptions[firstOption.name] === val.value;

              return (
                <div
                  key={`${firstOption.name}-${val.value}-${index}`}
                  className="flex flex-col items-center gap-2"
                >
                  <VariantButton
                    variant={representative}
                    onClick={() => onSelectOption(firstOption.name, val.value)}
                    className={cn(
                      "transition-all hover:-translate-y-0.5",
                      isSelected &&
                        "ring-primary ring-offset-background ring-2 ring-offset-2",
                    )}
                  />
                  <p className="text-sm font-medium">{val.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Other Options - with button selectors */}
      {otherOptions.length > 0 && (
        <div className="space-y-4">
          {otherOptions.map((opt) => (
            <div key={opt.id} className="space-y-3">
              <p className="text-foreground/80 text-lg font-semibold capitalize">
                {opt.name}
              </p>

              <div className="flex flex-wrap gap-2">
                {opt.values.map((val) => {
                  const isSelected = selectedOptions[opt.name] === val.value;
                  const desired = {
                    ...selectedOptions,
                    [opt.name]: val.value,
                  };
                  const exists = !!getVariantMatchingPartial(desired);

                  return (
                    <Button
                      key={`${opt.name}-${val.id}`}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      disabled={!exists}
                      className={cn(
                        "capitalize transition-all",
                        !exists && "opacity-60",
                      )}
                      onClick={() => onSelectOption(opt.name, val.value)}
                    >
                      {val.value}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductBrandBadge({
  brand,
  stock,
  className,
}: {
  brand: { logoUrl: string | null; name: string | null };
  stock: number;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("bg-background pr-0.5 pl-px", className)}
    >
      <ImageWithFallback
        src={brand.logoUrl}
        alt={brand.name ?? "unknown brand"}
        className="size-6 rounded-full border-none"
        width={16}
        height={16}
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-md">{brand.name}</span>
        <Badge
          variant={stock > 0 ? (stock < 4 ? "warning" : "success") : "error"}
          className="rounded-full"
        >
          {stock > 0 ? (
            stock < 4 ? (
              <AlertTriangleIcon />
            ) : (
              <CheckCircleIcon />
            )
          ) : (
            <XIcon />
          )}
          <span>{stock}</span>
          {stock > 0 ? "In Stock" : "Out of Stock"}
        </Badge>
      </div>
    </Badge>
  );
}

export function ProductSkeleton({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <MaxWidthWrapper
      className={cn("relative space-y-4 lg:grid lg:grid-cols-2", className)}
    >
      {/* Image Carousel Section */}
      <div className="h-fit lg:sticky lg:top-24">
        <div className="mx-auto aspect-square w-full lg:max-w-4/5">
          <Skeleton className="size-full" />
          <div className="mt-4 flex gap-2 overflow-x-auto">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className="size-20 flex-shrink-0 rounded-md"
              />
            ))}
          </div>
        </div>

        {/* Brand Badge - Mobile Only */}
        <div className="absolute top-2 right-6 z-10 md:right-14 lg:hidden">
          <Skeleton className="h-8 w-32" />
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-6">
        <Frame className="w-full">
          <FrameHeader>
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-8 w-3/4" />
              {/* Brand Badge - Desktop Only */}
              <div className="hidden lg:flex">
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-1 h-4 w-2/3" />
          </FrameHeader>

          <FramePanel>
            <Skeleton className="mb-3 h-4 w-16" />
            <div className="space-x-2 text-center lg:text-left">
              <Skeleton className="inline-block h-10 w-32 lg:h-12 lg:w-40" />
              <Skeleton className="inline-block h-6 w-20" />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </FramePanel>

          <FramePanel>
            <Skeleton className="mb-3 h-4 w-16" />
            <div className="space-y-3">
              <Skeleton className="h-5 w-20" />
              <div className="flex flex-wrap gap-2">
                <div className="flex flex-col items-center gap-2">
                  <Skeleton className="h-20 w-20 rounded-xl" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Skeleton className="h-20 w-20 rounded-xl" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Skeleton className="h-20 w-20 rounded-xl" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <Skeleton className="h-5 w-16" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
          </FramePanel>

          <FramePanel>
            <div className="flex flex-col gap-2 lg:flex-row">
              <Skeleton className="h-12 w-full lg:flex-1" />
              <Skeleton className="h-12 w-full" />
            </div>
          </FramePanel>
        </Frame>

        {children}
      </div>
    </MaxWidthWrapper>
  );
}
