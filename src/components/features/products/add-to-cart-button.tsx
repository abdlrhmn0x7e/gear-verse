"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QuantityStepper } from "~/components/quantity-stepper";
import { Button } from "~/components/ui/button";
import { DrawerTrigger } from "~/components/ui/drawer";
import { useVariantSelectionStore } from "~/stores/variant-selection/provider";
import { useTRPC } from "~/trpc/client";
import { CartDrawer } from "../../cart-drawer";
import { findCartLine } from "./hooks/use-selected-stock";

export function AddToCartButton({
  productId,
  productTitle,
  disabled,
}: {
  productId: number;
  productTitle: string;
  /** set when the selected item can't be bought, so the cart is never offered for it */
  disabled: boolean;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const variantId = useVariantSelectionStore(
    (state) => state.selectedVariant?.id,
  );

  const onSuccess = () => {
    void queryClient.invalidateQueries({
      queryKey: trpc.public.carts.queries.find.queryKey(),
    });
  };
  const onError = () => {
    toast.error("Couldn't update your cart. Try again.");
  };
  const { mutate: addToCart, isPending: addingToCart } = useMutation(
    trpc.public.carts.mutations.addItem.mutationOptions({ onSuccess, onError }),
  );
  const { mutate: removeFromCart, isPending: removingFromCart } = useMutation(
    trpc.public.carts.mutations.removeItem.mutationOptions({
      onSuccess,
      onError,
    }),
  );
  const { data: cart } = useQuery(
    trpc.public.carts.queries.find.queryOptions(),
  );

  const line = findCartLine(cart, productId, variantId);
  const item = { productId, productVariantId: variantId ?? null };

  if (line) {
    return (
      <div className="flex gap-3">
        <QuantityStepper
          quantity={line.quantity}
          itemLabel={productTitle}
          pending={addingToCart || removingFromCart}
          canIncrement={line.stock > line.quantity}
          onDecrement={() => removeFromCart(item)}
          onIncrement={() => addToCart(item)}
          className="h-12 px-1"
        />
        <CartDrawer
          Trigger={
            <DrawerTrigger asChild>
              <Button variant="outline" size="xl" className="flex-1">
                View cart
              </Button>
            </DrawerTrigger>
          }
        />
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="xl"
      className="w-full"
      onClick={() => addToCart(item)}
      disabled={addingToCart || disabled}
    >
      Add to cart
    </Button>
  );
}
