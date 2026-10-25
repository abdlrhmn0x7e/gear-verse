import { ArrowDownIcon, ArrowRightIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "~/i18n/navigation";
import { ProductCard } from "~/components/features/products/product-card";
import {
  ProductCarousel,
  ProductCarouselItem,
} from "~/components/features/products/product-carousel";
import {
  ProductRow,
  ProductRowItem,
  StoreTile,
} from "~/components/features/products/product-row";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Button } from "~/components/ui/button";
import { getHeroProducts, HERO_PRODUCT_COUNT } from "../_lib/queries";

export async function Hero() {
  const [products, t] = await Promise.all([
    getHeroProducts(),
    getTranslations("landing.hero"),
  ]);

  return (
    <section className="pt-28 pb-12 md:pt-32 md:pb-16">
      <MaxWidthWrapper className="space-y-10 md:space-y-12">
        <div className="space-y-6">
          <h1 className="text-display-sm lg:text-display max-w-5xl text-balance sm:text-[3.5rem]">
            {t("title")}
          </h1>

          <div className="flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
            <p className="text-muted-foreground text-body-lg max-w-xl text-pretty md:text-xl/relaxed">
              {t("description")}
            </p>
            <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
              <Button
                size="xl"
                nativeButton={false}
                render={<Link href="/products" />}
              >
                {t("shop")}
                <ArrowRightIcon
                  data-icon="inline-end"
                  className="rtl:-scale-x-100"
                />
              </Button>
              {/* a plain fragment link scrolls again when the URL already ends in #request; Link treats that as no navigation */}
              <Button
                variant="outline"
                size="xl"
                nativeButton={false}
                render={<a href="#request" />}
              >
                {t("request")}
                <ArrowDownIcon data-icon="inline-end" />
              </Button>
            </div>
          </div>
        </div>

        {products.length > HERO_PRODUCT_COUNT ? (
          // more pins than fit a row: page through them, ending on the way to the whole store
          <ProductCarousel label={t("trending")}>
            {products.map((product, index) => (
              <ProductCarouselItem key={product.id}>
                <ProductCard
                  product={product}
                  sizes="(min-width: 768px) 33vw, 80vw"
                  eager={index === 0}
                />
              </ProductCarouselItem>
            ))}
            <ProductCarouselItem>
              <StoreTile />
            </ProductCarouselItem>
          </ProductCarousel>
        ) : (
          products.length > 0 && (
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
          )
        )}
      </MaxWidthWrapper>
    </section>
  );
}
