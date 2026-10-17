import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "~/components/features/products/product-card";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { getLatestProducts } from "../_lib/queries";
import { SectionHeader } from "./section-header";

const desktopSpan = {
  0: "",
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
} as const;

export async function LatestProducts() {
  const products = await getLatestProducts();
  if (products.length === 0) return null;

  // a short catalog ends in a "see everything" tile that fills the last row, so the grid never looks unfinished
  const emptyDesktopSlots = ((4 - (products.length % 4)) % 4) as 0 | 1 | 2 | 3;

  return (
    <section className="py-12 md:py-16" aria-labelledby="latest-heading">
      <MaxWidthWrapper className="space-y-12">
        <SectionHeader
          id="latest-heading"
          title="Latest arrivals"
          description="Gear from international brands, ready to ship in Egypt."
          action={
            <Button variant="outline" asChild className="self-start md:self-auto">
              <Link href="/products">
                Shop all
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          }
        />

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}

          {emptyDesktopSlots > 0 && (
            <Link
              href="/products"
              className={cn(
                "bg-card hover:bg-accent group flex min-h-48 flex-col justify-between gap-8 rounded-3xl p-6 transition-[background-color] duration-150 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus md:p-8",
                products.length % 2 === 0 ? "col-span-2" : "col-span-1",
                desktopSpan[emptyDesktopSlots],
              )}
            >
              <p className="text-title max-w-xs text-balance">
                A curated store of the best international brands.
              </p>
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                See the whole store
                <ArrowRightIcon
                  className="size-4 transition-[translate] duration-150 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </Link>
          )}
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
