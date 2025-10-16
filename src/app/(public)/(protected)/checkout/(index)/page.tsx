import { ImageWithFallback } from "~/components/image-with-fallback";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { formatCurrency } from "~/lib/utils/format-currency";
import { api, HydrateClient } from "~/trpc/server";
import { CompleteCheckout } from "./_components/complete-checkout";
import type { RouterOutputs } from "~/trpc/react";
import { Heading } from "~/components/heading";

export default async function CheckoutPage() {
  void api.public.checkout.queries.getAddresses.prefetch();
  const cart = await api.public.carts.queries.find();
  const cols =
    cart.items.length > 1 ? (cart.items.length % 2 === 0 ? 2 : 3) : 1;

  return (
    <section>
      <MaxWidthWrapper className="grid min-h-screen grid-cols-1 gap-6 py-24 xl:grid-cols-3 xl:py-32">
        <HydrateClient>
          <CompleteCheckout
            className="xl:col-span-2"
            hasCartItems={cart.items.length > 0}
          >
            <OrderSummary cart={cart} cols={cols} isMobile />
          </CompleteCheckout>
        </HydrateClient>

        <div className="hidden lg:block">
          <OrderSummary cart={cart} cols={cols} />
        </div>
      </MaxWidthWrapper>
    </section>
  );
}

function OrderSummary({
  cart,
  cols,
  isMobile = false,
}: {
  cart: RouterOutputs["public"]["carts"]["queries"]["find"];
  cols: number;
  isMobile?: boolean;
}) {
  if (isMobile) {
    return (
      <div className="space-y-3">
        <Heading level={4}>Order Summary</Heading>

        {cart.items.map((item, index) => (
          <div className="flex gap-3" key={`item-${item.id}-${index}`}>
            <ImageWithFallback
              src={item.thumbnailUrl}
              alt={item.title}
              className="size-24 shrink-0 rounded-md"
              width={256}
              height={256}
            />

            <div className="flex flex-1 flex-col justify-between">
              <div>
                <p>
                  {item.quantity} x {item.title}
                </p>
                <p className="text-muted-foreground text-sm">
                  {item.values.join(", ")}
                </p>
              </div>

              <p className="text-primary-foreground text-right text-lg font-medium">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card className="h-fit space-y-3">
      <CardHeader>
        <CardTitle className="text-xl">Order Summary</CardTitle>
      </CardHeader>

      <CardContent className="space-y-8">
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {cart.items.map((item, index) => (
            <div
              key={`item-${item.id}-${index}`}
              className="overflow-hidden rounded-lg"
            >
              <AspectRatio key={`item-${item.id}-${index}`} ratio={16 / 10}>
                <ImageWithFallback
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="size-full shrink-0 rounded-none border-none"
                  width={512}
                  height={512}
                />
              </AspectRatio>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {cart.items.map((item, index) => (
            <div
              key={`item-${item.id}-${index}`}
              className="flex items-start justify-between gap-3 text-lg font-medium"
            >
              <div>
                <p>
                  {item.quantity} x {item.title}
                </p>
                <p className="text-muted-foreground text-sm">
                  {item.values.join(", ")}
                </p>
              </div>

              <p className="text-primary-foreground text-lg font-medium">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground font-medium">Total</p>
            <p className="text-lg font-medium">
              {formatCurrency(
                cart.items.reduce(
                  (acc, item) => acc + item.price * item.quantity,
                  0,
                ),
              )}
            </p>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground font-medium">Shipping</p>
              <p className="text-muted-foreground text-xs">
                Estimated delivery: 1–2 business days
              </p>
            </div>

            <p className="text-lg font-medium">
              {formatCurrency(130)} ~ {formatCurrency(150)}
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <p className="text-muted-foreground font-medium">Total</p>
          <p className="text-lg font-medium">
            {formatCurrency(
              cart.items.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0,
              ) + 130,
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
