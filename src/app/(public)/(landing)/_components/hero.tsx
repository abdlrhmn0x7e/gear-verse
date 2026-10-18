import { ArrowDownIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "~/components/features/products/product-card";
import {
  ProductRow,
  ProductRowItem,
  StoreTile,
} from "~/components/features/products/product-row";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Button } from "~/components/ui/button";
import { getHeroProducts, HERO_PRODUCT_COUNT } from "../_lib/queries";

export async function Hero() {
  const products = await getHeroProducts();

  return (
    <section className="pt-28 pb-12 md:pt-32 md:pb-16">
      <MaxWidthWrapper className="space-y-10 md:space-y-12">
        <div className="space-y-6">
          <h1 className="text-display-sm lg:text-display max-w-5xl text-balance sm:text-[3.5rem]">
            Gear worth the money, in stock in Egypt.
          </h1>

          <div className="flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
            <p className="text-muted-foreground text-body-lg max-w-xl text-pretty md:text-xl/relaxed">
              A short list of keyboards, mice and IEMs we&apos;d buy ourselves,
              delivered in 1–2 days. Not on the shelf? We&apos;ll get it for
              you.
            </p>
            <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
              <Button
                size="xl"
                nativeButton={false}
                render={<Link href="/products" />}
              >
                Shop the shelf
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
              {/* jumps down to the request form, so it points down rather than onward */}
              <Button
                variant="outline"
                size="xl"
                nativeButton={false}
                render={<Link href="/#request" />}
              >
                Request an item
                <ArrowDownIcon data-icon="inline-end" />
              </Button>
            </div>
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
