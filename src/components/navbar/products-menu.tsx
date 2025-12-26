import { IconShoppingBagX } from "@tabler/icons-react";
import type { RouterOutput } from "~/trpc/client";
import { app } from "~/server/application";
import { AspectRatio } from "../ui/aspect-ratio";
import { ImageWithFallback } from "../image-with-fallback";
import { Skeleton } from "../ui/skeleton";
import { NavLink } from "./nav";
import { cacheTag } from "next/cache";

export async function ProductsMenuContent() {
  "use cache";

  cacheTag("products-menu");

  const products = await app.public.products.queries.getPage({
    pageSize: 3,
  });

  if (products.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <IconShoppingBagX size={64} />
        <div className="text-center">
          <p className="text-lg font-medium">No products found</p>
          <p className="text-muted-foreground text-sm">
            Stay tuned for more rarities coming soon...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {products.data.map((product, idx) => (
        <ProductCard key={`product-${product.id}-${idx}`} products={product} />
      ))}
    </div>
  );
}

function ProductCard({
  products,
}: {
  products: RouterOutput["public"]["products"]["queries"]["getPage"]["data"][number];
}) {
  return (
    <NavLink href={`/products/${products.slug}`}>
      <div className="group bg-card h-full space-y-3 rounded-lg border p-1">
        <AspectRatio
          ratio={16 / 9}
          className="w-full overflow-hidden rounded-lg border bg-white"
        >
          <ImageWithFallback
            src={products.thumbnailUrl}
            alt={products.title}
            width={512}
            height={512}
            className="size-full border-none object-cover"
          />
        </AspectRatio>

        <div className="px-2 pb-3">
          <h4 className="line-clamp-1 font-medium">{products.title}</h4>
          <p className="text-muted-foreground line-clamp-3 text-sm">
            {products.summary}
          </p>
        </div>
      </div>
    </NavLink>
  );
}

export function ProductsMenuSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <ProductCardSkeleton />
      <ProductCardSkeleton />
      <ProductCardSkeleton />
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-card space-y-3 overflow-hidden rounded-lg border p-1">
      <AspectRatio
        ratio={16 / 9}
        className="w-full overflow-hidden rounded-lg border"
      >
        <Skeleton className="size-full rounded-md" />
      </AspectRatio>

      <div className="space-y-1 px-2 pb-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-2 w-24" />
      </div>
    </div>
  );
}
