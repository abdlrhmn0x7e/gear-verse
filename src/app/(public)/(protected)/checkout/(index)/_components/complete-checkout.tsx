"use client";

import { Button } from "~/components/ui/button";
import { CheckoutForm, type CheckoutFormValues } from "./checkout-form";
import { ArrowBigUpDashIcon, SparklesIcon } from "lucide-react";
import { Heading } from "~/components/heading";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { Spinner } from "~/components/spinner";
import { cn } from "~/lib/utils";

export function CompleteCheckout({
  hasCartItems,
  className,
}: {
  hasCartItems: boolean;
  className?: string;
}) {
  const router = useRouter();
  const { mutate: checkout, isPending: checkoutPending } =
    api.public.checkout.mutations.complete.useMutation({
      onSuccess: (order) => {
        router.push(`/checkout/success?orderId=${order.id}`);
      },
    });

  function onSubmit(data: CheckoutFormValues) {
    checkout(data);
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center gap-2">
        <SparklesIcon className="mb-1 size-6" />

        <Heading level={1} className="text-lg md:text-xl">
          Gear Verse
        </Heading>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4">
        <div
          className={cn(
            "flex-1 space-y-4",
            checkoutPending && "pointer-events-none opacity-50",
          )}
        >
          <Heading level={2}>Your Details</Heading>

          <CheckoutForm onSubmit={onSubmit} />
        </div>

        <Button
          className="w-full lg:w-auto"
          size="lg"
          form="checkout-form"
          disabled={!hasCartItems || checkoutPending}
        >
          {checkoutPending ? <Spinner /> : <ArrowBigUpDashIcon />}
          Checkout
        </Button>
      </div>
    </div>
  );
}
