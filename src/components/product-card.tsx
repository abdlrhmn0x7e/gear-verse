import { CheckCircleIcon, EyeIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "~/lib/utils/format-currency";
import type { RouterOutput } from "~/trpc/client";
import { Heading } from "./heading";
import { ImageWithFallback } from "./image-with-fallback";
import { AspectRatio } from "./ui/aspect-ratio";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";

export function ProductCard({
  product,
}: {
  product: RouterOutput["public"]["products"]["queries"]["getPage"]["data"][number];
}) {
  return (
    <Link href={`/products/${product.slug}`} className="group">
      <Card className="h-full gap-1 p-1">
        <CardHeader className="p-0">
          <AspectRatio
            ratio={16 / 10}
            className="overflow-hidden rounded-[calc(var(--radius)-var(--spacing))]"
          >
            <ImageWithFallback
              src={product.thumbnailUrl}
              alt={product.title}
              width={512}
              height={512}
              className="size-full rounded-none border-none"
              priority
            />
          </AspectRatio>
        </CardHeader>

        <CardContent className="flex-1 space-y-3 p-0">
          <div className="space-y-3 px-1">
            <div>
              <div className="flex items-center gap-2">
                <ImageWithFallback
                  src={product.brand.logoUrl}
                  alt={product.brand.name ?? "unknown brand"}
                  className="size-4 rounded-full"
                  width={16}
                  height={16}
                />
                <span className="lg:text-md mb-1 text-xs">
                  {product.brand.name}
                </span>
              </div>

              <Heading level={4}>{product.title}</Heading>

              <p className="text-muted-foreground line-clamp-3 text-sm lg:text-base">
                {product.summary}
              </p>
            </div>

            <p className="flex items-end gap-3">
              <span className="text-foreground dark:text-primary-foreground text-xl font-semibold">
                {formatCurrency(product.price)}
              </span>
              {product.strikeThroughPrice && (
                <span className="text-muted-foreground line-through">
                  {formatCurrency(product.strikeThroughPrice)}
                </span>
              )}
            </p>

            {!product.variants && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">
                  No variants available
                </p>
              </div>
            )}

            {product.variants && product.variants.length > 0 && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">
                  Available in {product.variants.length} variants
                </p>

                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <Badge
                      key={`${variant.id}-${variant.values.join(", ")}`}
                      variant="outline"
                      className="px-1 py-px"
                    >
                      <ImageWithFallback
                        src={variant.thumbnailUrl}
                        alt={`${product.title} - ${variant.values.join(", ")}`}
                        className="size-4 rounded-full"
                        width={16}
                        height={16}
                      />

                      <span className="capitalize">
                        {Object.values(variant.values).slice(0, 2).join(", ")}
                      </span>

                      {variant.stock > 0 ? (
                        <CheckCircleIcon className="size-3 text-green-500" />
                      ) : (
                        <XIcon className="size-3 text-red-500" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="mt-2 p-0">
          <Button className="w-full">
            <EyeIcon />
            View Details
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="group">
      <div className="bg-card space-y-3 rounded-lg border p-1">
        <AspectRatio
          ratio={16 / 10}
          className="overflow-hidden rounded-[calc(var(--radius)-var(--spacing))]"
        >
          <Skeleton className="size-full rounded-none border-none" />
        </AspectRatio>

        <div className="space-y-3">
          <div className="space-y-3 px-1">
            <div>
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>

              <Skeleton className="mt-2 h-6 w-3/4" />
              <div className="mt-2 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-10/12" />
              </div>
            </div>

            <div className="flex items-end gap-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 rounded-md border px-1 py-px"
                  >
                    <Skeleton className="size-4 rounded-full" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  );
}
