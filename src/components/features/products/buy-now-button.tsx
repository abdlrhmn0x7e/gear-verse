"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useVariantSelectionStore } from "~/stores/variant-selection/provider";
import { useTRPC } from "~/trpc/client";
import { findCartLine } from "./hooks/use-selected-stock";

export function BuyNowButton({
  productId,
  disabled,
  disabledLabel,
  size = "xl",
  className,
}: {
  productId: number;
  disabled: boolean;
  /** what the button says when the selected item can't be bought */
  disabledLabel: string;
  size?: "xl" | "lg";
  className?: string;
}) {
  const trpc = useTRPC();
  const router = useRouter();
  const selectedVariant = useVariantSelectionStore(
    (store) => store.selectedVariant,
  );
  const { data: cart } = useQuery(
    trpc.public.carts.queries.find.queryOptions(),
  );
  const { mutate: addItem, isPending: addingItem } = useMutation(
    trpc.public.carts.mutations.addItem.mutationOptions({
      onSuccess: () => {
        router.push("/checkout");
      },
      onError: () => {
        toast.error("Couldn't start checkout. Try again.");
      },
    }),
  );

  if (findCartLine(cart, productId, selectedVariant?.id)) {
    return (
      <Button size={size} className={cn("w-full", className)} asChild>
        <Link href="/checkout">Go to checkout</Link>
      </Button>
    );
  }

  return (
    <Button
      size={size}
      className={cn("w-full", className)}
      onClick={() =>
        addItem({
          productId,
          productVariantId: selectedVariant?.id ?? null,
        })
      }
      disabled={addingItem || disabled}
    >
      {addingItem && <Spinner />}
      {disabled ? disabledLabel : "Buy now"}
    </Button>
  );
}
