import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { getDiscountPercentage } from "~/components/features/products/product-card";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { formatCurrency } from "~/lib/utils/format-currency";
import { getLatestProducts } from "../_lib/queries";

export async function Hero() {
  const [featured] = await getLatestProducts();

  return (
    <section className="pt-28 pb-16 md:pt-36 md:pb-24">
      <MaxWidthWrapper
        className={cn(
          "grid items-center gap-12 lg:gap-16",
          featured && "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]",
        )}
      >
        <div
          className={cn(
            "flex flex-col items-start gap-8",
            !featured && "mx-auto max-w-3xl items-center text-center",
          )}
        >
          <Badge variant="brand">Hand-imported to Egypt</Badge>

          <div className="space-y-6">
            <h1 className="text-display-sm sm:text-[3.5rem] lg:text-display text-balance">
              The world&apos;s best gear, finally in Egypt.
            </h1>
            <p className="text-muted-foreground text-body-lg max-w-xl text-pretty md:text-xl/relaxed">
              Rare keyboards, mice and audio from international brands. We
              clear customs, insure every order and deliver to your door in 1–2
              days.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button size="xl" asChild>
              <Link href="/products">
                Shop the store
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <Link href="#how-it-works">How it works</Link>
            </Button>
          </div>
        </div>

        {featured && <FeaturedProduct product={featured} />}
      </MaxWidthWrapper>
    </section>
  );
}

function FeaturedProduct({
  product,
}: {
  product: Awaited<ReturnType<typeof getLatestProducts>>[number];
}) {
  const discount = getDiscountPercentage(
    product.price,
    product.strikeThroughPrice,
  );

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group image-well relative block aspect-square overflow-hidden rounded-[2rem] outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
    >
      <ImageWithFallback
        src={product.thumbnailUrl}
        alt={product.title}
        width={1080}
        height={1080}
        sizes="(min-width: 1024px) 45vw, 100vw"
        isPriority
        className="size-full rounded-none border-none bg-transparent p-[14%] transition-[scale] duration-500 ease-out motion-safe:group-hover:scale-[1.03]"
      />

      <div className="surface-control absolute inset-x-4 bottom-4 flex items-center gap-4 rounded-[1.25rem] p-3 pl-5 [--surface-radius:1.25rem] [--surface-shadow:var(--shadow-md)] sm:inset-x-6 sm:bottom-6">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{product.title}</p>
          <p className="flex items-baseline gap-2 text-sm tabular-nums">
            <span>{formatCurrency(product.price)}</span>
            {discount > 0 && (
              <s className="text-muted-foreground">
                <span className="sr-only">Was </span>
                {formatCurrency(product.strikeThroughPrice!)}
              </s>
            )}
          </p>
        </div>
        <span className="surface-solid flex size-10 shrink-0 items-center justify-center rounded-full transition-[scale] duration-150 motion-safe:group-active:scale-[0.96]">
          <ArrowRightIcon className="size-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
