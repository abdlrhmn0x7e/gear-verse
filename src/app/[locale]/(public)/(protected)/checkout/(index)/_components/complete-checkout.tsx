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
  const trpc = useTRPC();
  const router = useRouter();
  const { mutate: checkout, isPending: checkoutPending } = useMutation(
    trpc.public.checkout.mutations.complete.mutationOptions({
      onSuccess: (order) => {
        router.push(`/checkout/success?orderId=${order.id}`);
      },

      onError: (error) => {
        // bad requests carry a message meant for the customer (e.g. stock)
        toast.error(
          error.data?.code === "BAD_REQUEST" && !error.data.zodError
            ? error.message
            : "Unable to place your order. Check that the items in your cart are still in stock, then try again.",
        );
      },
    }),
  );

  function onSubmit(data: CompleteCheckoutInput) {
    checkout(data);
  }

  return (
    <div className={cn("relative flex flex-col gap-4", className)}>
      <h1 className="text-headline-sm md:text-display-sm text-balance">
        Checkout
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
            Your cart is empty.{" "}
            <Link
              href="/products"
              className="text-foreground underline decoration-from-font underline-offset-4"
            >
              Browse the store
            </Link>{" "}
            to add something.
          </p>
        )}

        {hasStockIssues && (
          <p className="text-destructive text-sm font-medium text-pretty lg:self-end lg:text-end">
            Some items are out of stock or short. Update them in your order
            summary to place your order.
          </p>
        )}

        {backorderTitles.length > 0 && (
          <Item variant="muted">
            <ItemMedia variant="icon">
              <ClockIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>
                {new Intl.ListFormat("en").format(backorderTitles)}{" "}
                {backorderTitles.length === 1 ? "is" : "are"} on backorder
              </ItemTitle>
              <ItemDescription className="line-clamp-none text-pretty">
                We source {backorderTitles.length === 1 ? "it" : "them"} in
                about {BACKORDER_LEAD_DAYS} days on average, counted from when
                we confirm your order on{" "}
                {whatsappNumber ? (
                  <a
                    href={whatsAppLink(whatsappNumber)}
                    target="_blank"
                    rel="noopener"
                  >
                    WhatsApp
                  </a>
                ) : (
                  "WhatsApp"
                )}
                .
              </ItemDescription>
            </ItemContent>
          </Item>
        )}

        <p className="text-muted-foreground text-sm text-pretty lg:self-end lg:text-end">
          By placing your order, you agree to our{" "}
          <Link
            href="/returns"
            className="text-foreground underline decoration-from-font underline-offset-4"
          >
            Returns &amp; Refunds Policy
          </Link>
          .
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
            Place order
          </Button>
        </div>
      </div>
    </div>
  );
}
