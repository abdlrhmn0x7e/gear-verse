import { CheckCircleIcon, EyeIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "~/lib/utils/format-currency";
import type { RouterOutputs } from "~/trpc/react";
import { Heading } from "./heading";
import { ImageWithFallback } from "./image-with-fallback";
import { AspectRatio } from "./ui/aspect-ratio";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export function ProductCard({
  product,
}: {
  product: RouterOutputs["public"]["products"]["queries"]["getPage"]["data"][number];
}) {
  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="bg-card space-y-3 rounded-lg border p-1">
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
          />
        </AspectRatio>

        <div className="space-y-3">
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
                <span className="text-md mb-1">{product.brand.name}</span>
              </div>

              <Heading level={4}>{product.title}</Heading>

              <p className="line-clamp-3">{product.summary}</p>
            </div>

            <p className="flex items-end gap-3">
              <span className="text-primary-foreground text-xl font-semibold">
                {formatCurrency(product.price)}
              </span>
              {product.strikeThroughPrice && (
                <span className="text-muted-foreground line-through">
                  {formatCurrency(product.strikeThroughPrice)}
                </span>
              )}
            </p>

            {product.variants.length > 0 && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">
                  Available in {product.variants.length} variants
                </p>

                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <Badge
                      key={`${variant.id}-${Object.values(variant.optionValues).join(", ")}`}
                      variant="outline"
                      className="px-1 py-px"
                    >
                      <ImageWithFallback
                        src={variant.thumbnailUrl}
                        alt={`${product.title} - ${Object.values(variant.optionValues).join(", ")}`}
                        className="size-4 rounded-full"
                        width={16}
                        height={16}
                      />

                      <span className="capitalize">
                        {Object.values(variant.optionValues)
                          .slice(0, 2)
                          .join(", ")}
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

          <Button className="w-full">
            <EyeIcon />
            View Details
          </Button>
        </div>
      </div>
    </Link>
  );
}
