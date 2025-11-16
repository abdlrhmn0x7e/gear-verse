"use client";

import { IconShoppingCart, IconShoppingCartPlus } from "@tabler/icons-react";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useMemo } from "react";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { useVariantSelectionStore } from "~/stores/variant-selection/provider";
import { CartDrawer } from "../../cart-drawer";
import { useTRPC } from "~/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DrawerTrigger } from "~/components/ui/drawer";

export function AddToCartButton({
  disabled,
  productId,
  ...props
}: React.ComponentProps<typeof Button> & {
  productId: number;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Get variant data from store
  const variant = useVariantSelectionStore((state) => state.selectedVariant);
  const variantId = variant?.id;
  const stock = variant?.stock ?? 0;

  const { mutate: addToCart, isPending: addingToCart } = useMutation(
    trpc.public.carts.mutations.addItem.mutationOptions(),
  );
  const { mutate: removeFromCart, isPending: removingFromCart } = useMutation(
    trpc.public.carts.mutations.removeItem.mutationOptions(),
  );
  const { data: cart } = useQuery(
    trpc.public.carts.queries.find.queryOptions(),
  );

  const currentCartItem = useMemo(
    () => cart?.items.find((item) => item.productVariantId === variantId),
    [cart, variantId],
  );

  const onSuccess = () => {
    void queryClient.invalidateQueries({
      queryKey: trpc.public.carts.queries.find.queryKey(),
    });
  };

  function handleAddToCart() {
    addToCart(
      { productId, productVariantId: variantId ?? null },
      {
        onSuccess,
      },
    );
  }

  function handleRemoveFromCart(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    removeFromCart(
      { productId, productVariantId: variantId ?? null },
      {
        onSuccess,
      },
    );
  }

  function handleIncreaseQuantity(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    addToCart(
      { productId, productVariantId: variantId ?? null },
      {
        onSuccess,
      },
    );
  }

  if (currentCartItem) {
    return (
      <div
        className={cn(
          "peer:bg-red-500 has-[>div:hover]:bg-accent relative flex size-full flex-1 items-center justify-between gap-3 rounded-lg border p-px transition-all has-[>div:hover]:cursor-pointer",
          (removingFromCart || addingToCart || stock === 0) &&
            "pointer-events-none opacity-50",
        )}
        role="button"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={handleRemoveFromCart}
              disabled={removingFromCart}
              className="w-full flex-1"
            >
              <MinusIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Decrease quantity</TooltipContent>
        </Tooltip>

        <CartDrawer
          Trigger={
            <DrawerTrigger asChild>
              <div className="flex items-center gap-2">
                <IconShoppingCart className="size-4" />

                <p className="text-sm font-medium">
                  {currentCartItem.quantity} in cart
                </p>
              </div>
            </DrawerTrigger>
          }
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={handleIncreaseQuantity}
              disabled={
                removingFromCart ||
                currentCartItem.stock === 0 ||
                currentCartItem.stock <= currentCartItem.quantity
              }
              className="w-full flex-1"
            >
              <PlusIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Increase quantity</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={addingToCart || (disabled ?? true) || stock <= 0}
      {...props}
    >
      <IconShoppingCartPlus />
      Add to Cart
    </Button>
  );
}
