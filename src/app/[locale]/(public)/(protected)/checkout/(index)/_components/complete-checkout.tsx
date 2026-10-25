"use client";

import { Button } from "~/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "~/components/ui/item";
import { BACKORDER_LEAD_DAYS } from "~/lib/utils/cart-stock";
import { whatsAppLink } from "~/lib/whatsapp";
import { CheckoutForm } from "./checkout-form";
import type { CompleteCheckoutInput } from "~/lib/schemas/contracts/public/checkout";
import { ClockIcon, LockIcon } from "lucide-react";
import { useTRPC } from "~/trpc/client";
import { Link, useRouter } from "~/i18n/navigation";
import { Spinner } from "~/components/spinner";
import { cn } from "~/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "~/components/ui/toast";
import { useLocale, useTranslations } from "next-intl";
import { useCustomerErrorMessage } from "~/lib/utils/customer-error-message";

export function CompleteCheckout({
  children,
  hasCartItems,
  hasStockIssues,
  backorderTitles,
  whatsappNumber,
  className,
}: {
  children: React.ReactNode;
  hasCartItems: boolean;
  /** a line asks for more than is left; the order would be rejected, so it can't be placed until the line is fixed */
  hasStockIssues: boolean;
  /** lines short on stock whose product takes backorders; they get sourced, so the customer is told about the wait */
  backorderTitles: string[];
  whatsappNumber: string | null;
  className?: string;
}) {
  const locale = useLocale();
  const t = useTranslations("checkout");
  const getErrorMessage = useCustomerErrorMessage();
  const trpc = useTRPC();
  const router = useRouter();
  const { mutate: checkout, isPending: checkoutPending } = useMutation(
    trpc.public.checkout.mutations.complete.mutationOptions({
      onSuccess: (order) => {
        router.push(`/checkout/success?orderId=${order.id}`);
      },

      onError: (error) => {
        toast.error(getErrorMessage(error, t("placeOrderError")));
      },
    }),
  );

  function onSubmit(data: CompleteCheckoutInput) {
    checkout(data);
  }

  return (
    <div className={cn("relative flex flex-col gap-4", className)}>
      <h1 className="text-headline-sm md:text-display-sm text-balance">
        {t("title")}
      </h1>

      <div className="flex flex-1 flex-col gap-4">
        <div
          className={cn(
            "space-y-4",
            checkoutPending && "pointer-events-none opacity-50",
          )}
        >
          <CheckoutForm onSubmit={onSubmit} />

          {/* Order Summary for Mobile */}
          <div className="block xl:hidden">{children}</div>
        </div>

        {/* the button below stays disabled without items, so say why and point back to the store */}
        {!hasCartItems && (
          <p className="text-muted-foreground text-sm text-pretty lg:self-end lg:text-end">
            {t.rich("emptyCart", {
              link: (chunks) => (
                <Link
                  href="/products"
                  className="text-foreground underline decoration-from-font underline-offset-4"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
        )}

        {hasStockIssues && (
          <p className="text-destructive text-sm font-medium text-pretty lg:self-end lg:text-end">
            {t("stockIssues")}
          </p>
        )}

        {backorderTitles.length > 0 && (
          <Item variant="muted">
            <ItemMedia variant="icon">
              <ClockIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>
                {/* one flex item, as the plain sentence was, so the title's gap doesn't split the names */}
                <span>
                  {t.rich("backorder.title", {
                    count: backorderTitles.length,
                    // each product name isolated, so a Latin title keeps its place in an Arabic list
                    list: () =>
                      new Intl.ListFormat(locale)
                        .formatToParts(backorderTitles)
                        .map((part, index) =>
                          part.type === "element" ? (
                            <bdi key={index}>{part.value}</bdi>
                          ) : (
                            part.value
                          ),
                        ),
                  })}
                </span>
              </ItemTitle>
              <ItemDescription className="line-clamp-none text-pretty">
                {t.rich("backorder.description", {
                  count: backorderTitles.length,
                  days: BACKORDER_LEAD_DAYS,
                  whatsapp: (chunks) =>
                    whatsappNumber ? (
                      <a
                        href={whatsAppLink(whatsappNumber)}
                        target="_blank"
                        rel="noopener"
                      >
                        {chunks}
                      </a>
                    ) : (
                      chunks
                    ),
                })}
              </ItemDescription>
            </ItemContent>
          </Item>
        )}

        <p className="text-muted-foreground text-sm text-pretty lg:self-end lg:text-end">
          {t.rich("agreeToReturns", {
            link: (chunks) => (
              <Link
                href="/returns"
                className="text-foreground underline decoration-from-font underline-offset-4"
              >
                {chunks}
              </Link>
            ),
          })}
        </p>

        {/* pinned to the bottom on phones, but in flow at the end, so it never hides what's after it */}
        <div
          data-slot="checkout-bar"
          className="bg-background/90 sticky bottom-0 z-30 -mx-6 border-t px-6 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:static lg:mx-0 lg:self-end lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
        >
          <Button
            className="w-full min-w-48 lg:w-fit"
            size="xl"
            type="submit"
            form="checkout-form"
            disabled={!hasCartItems || hasStockIssues || checkoutPending}
          >
            {checkoutPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <LockIcon data-icon="inline-start" />
            )}
            {t("placeOrder")}
          </Button>
        </div>
      </div>
    </div>
  );
}
