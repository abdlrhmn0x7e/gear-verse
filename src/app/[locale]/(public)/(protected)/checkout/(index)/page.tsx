import { ImageWithFallback } from "~/components/image-with-fallback";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { formatCurrency } from "~/lib/utils/format-currency";
import { api, HydrateClient, prefetch, trpc } from "~/trpc/server";
import { CompleteCheckout } from "./_components/complete-checkout";
import type { RouterOutput } from "~/trpc/client";
import { Heading } from "~/components/heading";
import { requireAuth } from "~/server/auth";
import { CartStockNotice } from "~/components/cart-stock-notice";
import { blocksCheckout, getStockIssue } from "~/lib/utils/cart-stock";
import { OrderTotals } from "../../_components/order-totals";
import { getStoreSettings } from "~/lib/store-settings";
import { useLocale } from "next-intl";

export default async function CheckoutPage() {
  await requireAuth();
  void prefetch(trpc.public.checkout.queries.getAddresses.queryOptions());
  const [cart, { whatsappNumber }] = await Promise.all([
    api.public.carts.queries.find(),
    getStoreSettings(),
  ]);
  const cols =
    cart.items.length > 1 ? (cart.items.length % 2 === 0 ? 2 : 3) : 1;

  return (
    <section>
      <MaxWidthWrapper className="grid min-h-screen grid-cols-1 gap-6 pt-28 pb-24 md:pt-36 xl:grid-cols-3 xl:pb-32">
        <HydrateClient>
          <CompleteCheckout
            className="xl:col-span-2"
            hasCartItems={cart.items.length > 0}
            hasStockIssues={cart.items.some(blocksCheckout)}
            backorderTitles={cart.items
              .filter((item) => getStockIssue(item) === "backorder")
              .map((item) => item.title)}
            whatsappNumber={whatsappNumber}
          >
            <OrderSummary cart={cart} cols={cols} isMobile />
          </CompleteCheckout>
        </HydrateClient>

        {/* sticks under the navbar; taller than a laptop screen, so it scrolls on its own rather than cutting off the total */}
        <div className="hidden [scrollbar-width:none] xl:sticky xl:top-24 xl:block xl:max-h-[calc(100dvh-7rem)] xl:self-start xl:overflow-y-auto xl:rounded-3xl">
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
  cart: RouterOutput["public"]["carts"]["queries"]["find"];
  cols: number;
  isMobile?: boolean;
}) {
  const locale = useLocale();
  const subtotal = cart.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const empty = cart.items.length === 0 && (
    <p className="text-muted-foreground">Your cart is empty.</p>
  );

  if (isMobile) {
    return (
      <div className="space-y-3">
        <Heading level={4}>Order summary</Heading>
        {empty}

        {cart.items.map((item, index) => (
          <div className="flex gap-3" key={`item-${item.id}-${index}`}>
            <div className="image-well outline-image-outline size-24 shrink-0 overflow-hidden rounded-xl outline-1 -outline-offset-1">
              <ImageWithFallback
                src={item.thumbnailUrl}
                alt={item.title}
                className="size-full rounded-none border-none"
                width={256}
                height={256}
              />
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <div>
                <p>
                  {item.quantity} x {item.title}
                </p>
                <p className="text-muted-foreground text-sm">
                  {item.values && `- ${item.values.join(", ")}`}
                </p>
                <CartStockNotice item={item} className="mt-1" />
              </div>

              <p className="text-end text-lg font-medium">
                {formatCurrency(item.price * item.quantity, locale)}
              </p>
            </div>
          </div>
        ))}

        <Separator />
        <OrderTotals subtotal={subtotal} />
      </div>
    );
  }

  return (
    <Card className="h-fit space-y-3">
      <CardHeader>
        <CardTitle className="text-xl">Order summary</CardTitle>
      </CardHeader>

      <CardContent className="space-y-8">
        {empty}
        <div
          className="grid gap-2 empty:hidden"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {cart.items.map((item, index) => (
            <div
              key={`item-${item.id}-${index}`}
              className="image-well outline-image-outline overflow-hidden rounded-lg outline-1 -outline-offset-1"
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

        <div className="space-y-4 empty:hidden">
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
                  {item.values && `- ${item.values.join(", ")}`}
                </p>
                <CartStockNotice item={item} className="mt-1" />
              </div>

              <p className="text-lg font-medium">
                {formatCurrency(item.price * item.quantity, locale)}
              </p>
            </div>
          ))}
        </div>

        <Separator />

        <OrderTotals subtotal={subtotal} />
      </CardContent>
    </Card>
  );
}
