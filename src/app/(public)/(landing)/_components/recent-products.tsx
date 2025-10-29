import { Heading } from "~/components/heading";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { ProductsCarousel } from "./products-carousel";
import Glow from "~/components/ui/glow";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { PackageIcon } from "lucide-react";
import { app } from "~/server/application";

export async function RecentProducts() {
  const products = await app.public.products.queries.getPage({ pageSize: 10 });

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

        <ProductsCarousel products={products.data} />

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
