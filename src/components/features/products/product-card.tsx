import Link from "next/link";
import { formatCurrency } from "~/lib/utils/format-currency";
import type { RouterOutput } from "~/trpc/client";
import { ImageWithFallback } from "../../image-with-fallback";
import { Badge } from "../../ui/badge";
import { Skeleton } from "../../ui/skeleton";

export type ProductCardItem =
  RouterOutput["public"]["products"]["queries"]["getPage"]["data"][number];

export function getDiscountPercentage(
  price: number,
  strikeThroughPrice: number | null | undefined,
) {
  if (!strikeThroughPrice || strikeThroughPrice <= price) return 0;
  return Math.round(((strikeThroughPrice - price) / strikeThroughPrice) * 100);
}

export function ProductCard({
  product,
  sizes = "(min-width: 1024px) 25vw, 50vw",
}: {
  product: ProductCardItem;
  sizes?: string;
}) {
  const discount = getDiscountPercentage(
    product.price,
    product.strikeThroughPrice,
  );
  const optionCount = product.variants?.length ?? 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col gap-4 rounded-3xl outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
    >
      <div className="image-well relative aspect-square overflow-hidden rounded-3xl">
        {discount > 0 && (
          <Badge variant="brand" className="absolute top-3 left-3 z-10">
            Save {discount}%
          </Badge>
        )}
        <ImageWithFallback
          src={product.thumbnailUrl}
          alt={product.title}
          width={640}
          height={640}
          sizes={sizes}
          className="size-full rounded-none border-none bg-transparent p-[12%] transition-[scale] duration-300 ease-out motion-safe:group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-col gap-1 px-1">
        {product.brand.name && (
          <p className="text-muted-foreground text-sm">{product.brand.name}</p>
        )}
        <h3 className="line-clamp-2 font-medium text-pretty">
          {product.title}
        </h3>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-2 tabular-nums">
          <span className="font-medium">{formatCurrency(product.price)}</span>
          {discount > 0 && (
            <s className="text-muted-foreground text-sm">
              <span className="sr-only">Was </span>
              {formatCurrency(product.strikeThroughPrice!)}
            </s>
          )}
        </p>
        {optionCount > 1 && (
          <p className="text-muted-foreground text-sm">
            {optionCount} options
          </p>
        )}
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      <Skeleton className="aspect-square rounded-3xl" />
      <div className="flex flex-col gap-2 px-1">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
}

/** Grid for the store and category listings, which share their row with the filter sidebar. */
export const productGridClassName =
  "grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 xl:grid-cols-3";
