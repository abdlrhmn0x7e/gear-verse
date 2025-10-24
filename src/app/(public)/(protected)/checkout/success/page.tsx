import { BadgeCheckIcon, PackageIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { Heading } from "~/components/heading";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/trpc/server";
import { formatCurrency } from "~/lib/utils/format-currency";
import { Separator } from "~/components/ui/separator";
import { PaymentMethod } from "../../_components/payment-method";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { requireAuth } from "~/server/auth";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId: string }>;
}) {
  await requireAuth();
  const { orderId } = await searchParams;
  const parsedOrderId = Number(orderId);
  if (isNaN(parsedOrderId)) {
    return notFound();
  }

  const order = await api.public.orders.queries.findById({ id: parsedOrderId });
  if (!order) {
    return notFound();
  }

  return (
    <section>
      <MaxWidthWrapper className="flex min-h-screen max-w-2xl flex-col items-center justify-center space-y-8 py-32">
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
        <Card className="w-full">
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
            </div>

            <Separator />

            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={`item-${item.id}-${index}`}
                  className="w-full space-y-2"
                >
                  <div className="flex gap-3">
                    <ImageWithFallback
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="size-12 shrink-0 rounded-md"
                      width={128}
                      height={128}
                    />
                    <div>
                      <p className="text-lg font-medium">
                        {item.quantity} x {item.title}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {item.values && `${item.values.join(", ")}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <p className="text-muted-foreground text-sm font-medium">
                      Sub Total
                    </p>

                    <p className="text-primary-foreground text-lg font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Separator />

            <div className="flex items-center justify-between gap-3">
              <p className="text-muted-foreground font-medium">Total Price</p>
              <p className="text-lg font-medium">
                {formatCurrency(
                  order.items.reduce(
                    (acc, item) => acc + item.quantity * item.price,
                    150,
                  ),
                )}
              </p>
            </div>
          </CardContent>

          <CardFooter>
            <Button className="w-full" variant="link" asChild>
              <Link href="/orders">
                <PackageIcon />
                Track your orders
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </MaxWidthWrapper>
    </section>
  );
}
