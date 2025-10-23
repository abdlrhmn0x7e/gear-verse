"use client";

import { AlertTriangleIcon, CheckCircleIcon, XIcon } from "lucide-react";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { useVariantSelectionStore } from "~/stores/variant-selection/provider";

export interface BadgeBrand {
  logoUrl: string | null;
  name: string | null;
}

export function ProductBrandBadge({
  brand,
  className,
}: {
  brand: BadgeBrand;
  className?: string;
}) {
  const stock =
    useVariantSelectionStore((store) => store.selectedVariant?.stock) ?? 0;

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
