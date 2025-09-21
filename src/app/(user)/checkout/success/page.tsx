import { BadgeCheckIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { Heading } from "~/components/heading";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/server";
import { formatCurrency } from "~/lib/utils/format-currency";
import { Separator } from "~/components/ui/separator";
import { PaymentMethod } from "../../orders/_components/payment-method";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId: string }>;
}) {
  const { orderId } = await searchParams;
  const parsedOrderId = parseInt(orderId);
  if (isNaN(parsedOrderId)) {
    return notFound();
  }

  const order = await api.user.orders.findById({ id: parsedOrderId });
  if (!order) {
    return notFound();
  }

  return (
    <section className="min-h-screen py-32 sm:py-48">
      <MaxWidthWrapper className="max-w-2xl space-y-8">
        <div className="flex flex-col items-center gap-4">
          <BadgeCheckIcon className="size-24 text-green-500 dark:text-green-300" />
          <div className="text-center">
            <Heading level={1}>Order Success</Heading>
            <p className="text-muted-foreground text-pretty">
              Thank you for your order! Your order is being processed and our
              team will contact you soon via WhatsApp.
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Order Summary</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-muted-foreground font-medium">Order ID</p>
                <p className="text-lg font-medium">{parsedOrderId}</p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-muted-foreground font-medium">
                  Payment Method
                </p>

                <PaymentMethod paymentMethod={order.paymentMethod} />
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="text-muted-foreground font-medium">Total Price</p>
                <p className="text-lg font-medium">
                  {formatCurrency(
                    order.items.reduce(
                      (acc, item) =>
                        acc + item.quantity * item.productVariant.price,
                      0,
                    ),
                  )}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-2 divide-y [&>div]:py-4">
              {order.items.map((item) => (
                <div key={item.productVariant.name} className="flex gap-4">
                  <ImageWithFallback
                    src={item.productVariant.thumbnail?.url}
                    alt={item.productVariant.name}
                    className="size-24 shrink-0"
                    width={512}
                    height={512}
                  />

                  <div>
                    <p className="font-medium">{`${item.quantity}x ${item.productVariant.product.name} - ${item.productVariant.name}`}</p>
                    <p className="text-muted-foreground line-clamp-3 text-sm">
                      {item.productVariant.product.summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </MaxWidthWrapper>
    </section>
  );
}
