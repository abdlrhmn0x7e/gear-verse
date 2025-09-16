import { Heading } from "~/components/heading";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { api } from "~/trpc/server";
import { ProductCardSkeleton, ProductsCarousel } from "./products-carousel";
import Glow from "~/components/ui/glow";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { PackageIcon } from "lucide-react";
import { Suspense } from "react";

export function RecentProducts() {
  void api.user.products.getPage.prefetch({
    pageSize: 10,
  });

  return (
    <section className="relative py-24">
      <MaxWidthWrapper className="space-y-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <Heading level={1}>Our Latest Rare Gear Collection</Heading>
            <p className="text-muted-foreground text-lg">
              {
                "Gaming gear choices are limited in Egypt. We're here to change that. Take a look at our latest collection."
              }
            </p>
          </div>

          <Button asChild className="hidden md:flex" size="lg">
            <Link href="/products">
              <PackageIcon />
              Browse Available Gear
            </Link>
          </Button>
        </div>

        <Suspense fallback={<ProductCardSkeleton />}>
          <ProductsCarousel />
        </Suspense>

        <Button asChild className="flex h-12 w-full md:hidden" size="lg">
          <Link href="/products">
            <PackageIcon />
            Browse Available Gear
          </Link>
        </Button>
      </MaxWidthWrapper>
      <Glow variant="center" />
    </section>
  );
}
