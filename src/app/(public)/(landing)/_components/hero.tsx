import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "~/components/features/products/product-card";
import {
  ProductRow,
  ProductRowItem,
  StoreTile,
} from "~/components/features/products/product-row";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Button } from "~/components/ui/button";
import { getLatestProducts } from "../_lib/queries";

export const HERO_PRODUCT_COUNT = 3;

export async function Hero() {
  const products = (await getLatestProducts()).slice(0, HERO_PRODUCT_COUNT);

  return (
    <section className="pt-28 pb-12 md:pt-32 md:pb-16">
      <MaxWidthWrapper className="space-y-10 md:space-y-12">
        <div className="space-y-6">
          <h1 className="text-display-sm sm:text-[3.5rem] lg:text-display max-w-5xl text-balance">
            The world&apos;s best gear, finally in Egypt.
          </h1>

          <div className="flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
            <p className="text-muted-foreground text-body-lg max-w-xl text-pretty md:text-xl/relaxed">
              Rare gear from international brands, cleared through customs,
              insured and delivered to your door in 1–2 days.
            </p>
            <Button size="xl" asChild className="shrink-0">
              <Link href="/products">
                Shop the store
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>

        {products.length > 0 && (
          <ProductRow className="md:grid-cols-3">
            {products.map((product, index) => (
              <ProductRowItem key={product.id}>
                <ProductCard
                  product={product}
                  sizes="(min-width: 768px) 33vw, 80vw"
                  eager={index === 0}
                />
              </ProductRowItem>
            ))}

            {products.length < HERO_PRODUCT_COUNT && (
              <ProductRowItem>
                <StoreTile />
              </ProductRowItem>
            )}
          </ProductRow>
        )}
      </MaxWidthWrapper>
    </section>
  );
}
