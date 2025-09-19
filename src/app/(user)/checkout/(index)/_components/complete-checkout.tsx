"use client";

import { Button } from "~/components/ui/button";
import { CheckoutForm, type CheckoutFormValues } from "./checkout-form";
import { ArrowBigUpDashIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { Spinner } from "~/components/spinner";
import { useRouter } from "next/navigation";

export function CompleteCheckout({
  hasCartItems,
  className,
}: {
  hasCartItems: boolean;
  className?: string;
}) {
  const utils = api.useUtils();
  const router = useRouter();
  const { mutate: completeCheckout, isPending: completingCheckout } =
    api.user.checkout.complete.useMutation({
      onSuccess: () => {
        void utils.user.carts.invalidate();
        void utils.user.products.invalidate();

        router.push("/checkout/success");
      },
      onError: () => {
        toast.error("Failed to complete checkout");
      },
    });

  function onSubmit(data: CheckoutFormValues) {
    completeCheckout(data);
  }

  return (
    <div className={cn("flex flex-col justify-between gap-4", className)}>
      <CheckoutForm onSubmit={onSubmit} />
      <Button
        className="w-full lg:w-auto"
        size="lg"
        form="checkout-form"
        disabled={completingCheckout || !hasCartItems}
      >
        {completingCheckout ? <Spinner /> : <ArrowBigUpDashIcon />}
        Checkout
      </Button>
    </div>
  );
}
