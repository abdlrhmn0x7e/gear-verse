import { ArrowRightIcon, CheckIcon } from "lucide-react";
import { Link } from "~/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { Button } from "~/components/ui/button";
import { getStoreSettings } from "~/lib/store-settings";
import { getSession } from "~/server/auth";
import { api } from "~/trpc/server";
import { OrderDetails } from "../../_components/order-details";
import { SaveOrdersPrompt } from "../../_components/save-orders-prompt";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId: string }>;
}) {
  const session = await getSession();
  if (!session) {
    return notFound();
  }
  const { orderId } = await searchParams;
  const parsedOrderId = Number(orderId);
  if (isNaN(parsedOrderId)) {
    return notFound();
  }

  const [order, { whatsappNumber }, t] = await Promise.all([
    api.public.orders.queries.findById({ id: parsedOrderId }),
    getStoreSettings(),
    getTranslations("checkout.success"),
  ]);
  if (!order) {
    return notFound();
  }

  return (
    <section>
      <MaxWidthWrapper className="min-h-dvh max-w-2xl pt-28 pb-24 md:pt-36">
        <header className="flex flex-col items-center gap-5 text-center">
          <span className="bg-brand-subtle text-brand-text flex size-14 items-center justify-center rounded-full">
            <CheckIcon className="size-7" strokeWidth={2.5} aria-hidden />
          </span>
          <div className="space-y-2">
            <h1 className="text-headline-sm md:text-display-sm text-balance">
              {t("title")}
            </h1>
            <p className="text-muted-foreground mx-auto max-w-md text-pretty">
              {t.rich("description", {
                // a string, so the number isn't grouped like a price
                id: String(order.id),
                number: (chunks) => (
                  <span className="text-foreground font-medium tabular-nums">
                    {chunks}
                  </span>
                ),
              })}
            </p>
          </div>
        </header>

        <OrderDetails
          order={order}
          whatsappNumber={whatsappNumber}
          headingLevel={2}
          className="mt-10"
        />

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            size="xl"
            nativeButton={false}
            render={<Link href={`/orders?orderId=${order.id}`} />}
          >
            {t("track")}
            <ArrowRightIcon
              data-icon="inline-end"
              className="rtl:-scale-x-100"
            />
          </Button>
          <Button
            size="xl"
            variant="ghost"
            nativeButton={false}
            render={<Link href="/products" />}
          >
            {t("continue")}
            <ArrowRightIcon
              data-icon="inline-end"
              className="rtl:-scale-x-100"
            />
          </Button>
        </div>

        {session.user.isAnonymous === true && (
          <SaveOrdersPrompt
            callbackURL={`/checkout/success?orderId=${order.id}`}
            className="mt-10"
          />
        )}
      </MaxWidthWrapper>
    </section>
  );
}
