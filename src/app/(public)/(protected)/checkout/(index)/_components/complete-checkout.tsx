"use client";

import { Button } from "~/components/ui/button";
import { CheckoutForm, type CheckoutFormValues } from "./checkout-form";
import { LockIcon } from "lucide-react";
import { Heading } from "~/components/heading";
import { useTRPC } from "~/trpc/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Spinner } from "~/components/spinner";
import { cn } from "~/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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

  const router = useRouter();
  const { mutate: checkout, isPending: checkoutPending } = useMutation(
    trpc.public.checkout.mutations.complete.mutationOptions({
      onSuccess: (order) => {
        router.push(`/checkout/success?orderId=${order.id}`);
      },

      onError: () => {
        toast.error(
          "Something went wrong please make sure the items in your cart are still available in the store",
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
          <Heading level={2}>Your Details</Heading>

          <CheckoutForm onSubmit={onSubmit} />

          {/* Order Summary for Mobile */}
          <div className="block lg:hidden">{children}</div>
        </div>

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

        <Button
          className="sticky inset-x-0 bottom-24 min-w-48 lg:relative lg:inset-x-auto lg:bottom-auto lg:w-fit lg:justify-start lg:self-end"
          size="lg"
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
  );
}
