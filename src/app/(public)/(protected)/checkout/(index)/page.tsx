import { Heading } from "~/components/heading";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { formatCurrency } from "~/lib/utils/format-currency";
import type { RouterOutputs } from "~/trpc/react";
import { api } from "~/trpc/server";
import { CompleteCheckout } from "./_components/complete-checkout";
import { IconShoppingBagX } from "@tabler/icons-react";

export default async function CheckoutPage() {
  const cart = await api.public.carts.find();

  return (
    <section>
      <MaxWidthWrapper className="grid min-h-screen grid-cols-1 gap-8 pt-28 pb-12 lg:grid-cols-2 lg:divide-x lg:pt-32">
        <div className="order-1 h-full space-y-4 px-4 lg:order-first">
          <Heading level={2}>Order Summary</Heading>

          <div className="flex h-full flex-col justify-between gap-2">
            <div className="scroll-shadow flex-1 space-y-2 overflow-y-auto pt-1">
              {cart.items.length > 0 ? (
                cart.items.map((item) => (
                  <ItemCard key={item.productVariant?.id} item={item} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <IconShoppingBagX size={64} />
                  <p className="text-muted-foreground text-sm">
                    Your cart is empty
                  </p>
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center justify-between border-t py-12 lg:py-24">
              <Heading level={3}>Total Amount:</Heading>
              <p className="text-muted-foreground mt-px text-2xl font-medium">
                {formatCurrency(
                  cart.items.reduce(
                    (acc, item) => acc + (item.productVariant?.price ?? 0),
                    0,
                  ),
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex h-full flex-col gap-4">
          <Heading level={2}>Checkout</Heading>
          <CompleteCheckout
            className="flex-1 pb-10"
            hasCartItems={cart.items.length > 0}
          />
        </div>
      </MaxWidthWrapper>
    </section>
  );
}

function ItemCard({
  item,
}: {
  item: RouterOutputs["public"]["carts"]["find"]["items"][number];
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-1">
      <ImageWithFallback
        src={item.productVariant?.thumbnail?.url}
        alt={item.productVariant?.product?.name ?? "Product"}
        className="size-32 shrink-0"
        width={256}
        height={200}
      />

      <div className="flex-1 space-y-2">
        <Heading level={4}>
          {item.quantity} x {item.productVariant?.product?.name} (
          {item.productVariant?.name})
        </Heading>

        <div className="flex items-center gap-1">
          <p className="font-medium">Total Amount:</p>
          <p className="text-muted-foreground mt-px text-sm">
            {formatCurrency((item.productVariant?.price ?? 0) * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  );
}
