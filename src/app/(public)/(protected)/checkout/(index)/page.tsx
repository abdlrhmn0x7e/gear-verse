import { ImageWithFallback } from "~/components/image-with-fallback";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { formatCurrency } from "~/lib/utils/format-currency";
import { api } from "~/trpc/server";

export default async function CheckoutPage() {
  const cart = await api.public.carts.queries.find();
  const cols =
    cart.items.length > 1 ? (cart.items.length % 2 === 0 ? 2 : 3) : 1;

  return (
    <section className="min-h-screen py-32">
      <MaxWidthWrapper className="hidden gap-6 lg:grid lg:grid-cols-2 xl:grid-cols-3">
        <Card>
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
      </MaxWidthWrapper>
    </section>
  );
}
