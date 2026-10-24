import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "~/components/features/products/product-card";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Button } from "~/components/ui/button";
import {
  getHeroProducts,
  getLatestProducts,
  MORE_PRODUCT_COUNT,
} from "../_lib/queries";
import { SectionHeader } from "./section-header";

/** The newest products the hero row isn't already showing; nothing renders while the whole catalog fits in the hero. */
export async function MoreProducts() {
  const [hero, latest] = await Promise.all([
    getHeroProducts(),
    getLatestProducts(),
  ]);
  const inHero = new Set(hero.map((product) => product.id));
  const products = latest
    .filter((product) => !inHero.has(product.id))
    .slice(0, MORE_PRODUCT_COUNT);
  if (products.length === 0) return null;

  return (
    <section className="py-12 md:py-16" aria-labelledby="more-products-heading">
      <MaxWidthWrapper className="space-y-12">
        <SectionHeader
          id="more-products-heading"
          title="New on the shelf"
          action={
            <Button
              variant="outline"
              className="self-start md:self-auto"
              nativeButton={false}
              render={<Link href="/products" />}
            >
              Shop all
              <ArrowRightIcon
                data-icon="inline-end"
                className="rtl:-scale-x-100"
              />
            </Button>
          }
        />

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
