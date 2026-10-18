import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "~/components/features/products/product-card";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Button } from "~/components/ui/button";
import { getLatestProducts } from "../_lib/queries";
import { HERO_PRODUCT_COUNT } from "./hero";
import { SectionHeader } from "./section-header";

/** Whatever the hero row had no room for; nothing renders while the whole catalog fits in the hero. */
export async function MoreProducts() {
  const products = (await getLatestProducts()).slice(HERO_PRODUCT_COUNT);
  if (products.length === 0) return null;

  return (
    <section className="py-12 md:py-16" aria-labelledby="more-products-heading">
      <MaxWidthWrapper className="space-y-12">
        <SectionHeader
          id="more-products-heading"
          title="More from the store"
          action={
            <Button
              variant="outline"
              asChild
              className="self-start md:self-auto"
            >
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
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
