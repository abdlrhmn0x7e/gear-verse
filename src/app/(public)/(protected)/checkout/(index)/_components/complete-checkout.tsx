"use client";

import { Button } from "~/components/ui/button";
import { CheckoutForm, type CheckoutFormValues } from "./checkout-form";
import { LockIcon } from "lucide-react";
import { useTRPC } from "~/trpc/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner } from "~/components/spinner";
import { cn } from "~/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "~/components/ui/toast";

export function CompleteCheckout({
  children,
  hasCartItems,
  hasStockIssues,
  className,
}: {
  children: React.ReactNode;
  hasCartItems: boolean;
  /** a line asks for more than is left; the order would be rejected, so it can't be placed until the line is fixed */
  hasStockIssues: boolean;
  className?: string;
}) {
  const trpc = useTRPC();
  // the form picks the first saved address, so having one means one is selected
  const { data: addresses } = useQuery(
    trpc.public.checkout.queries.getAddresses.queryOptions(),
  );
  const needsAddress = addresses?.length === 0;

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

  function onSubmit(data: CheckoutFormValues) {
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
          <p className="text-muted-foreground text-sm text-pretty lg:self-end lg:text-right">
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
          <p className="text-destructive text-sm font-medium text-pretty lg:self-end lg:text-right">
            Some items are out of stock or short. Update them in your order
            summary to place your order.
          </p>
        )}

        <p className="text-muted-foreground text-sm text-pretty lg:self-end lg:text-right">
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
            form="checkout-form"
            disabled={
              !addresses?.length ||
              !hasCartItems ||
              hasStockIssues ||
              checkoutPending
            }
          >
            {checkoutPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <LockIcon data-icon="inline-start" />
            )}
            {needsAddress ? "Add an address to continue" : "Place order"}
          </Button>
        </div>
      </div>
    </div>
  );
}
