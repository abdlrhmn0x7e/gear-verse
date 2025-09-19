"use client";

import { IconShoppingCartPlus, IconShoppingCartX } from "@tabler/icons-react";
import { useMemo } from "react";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

export function AddToCartButton({
  productVariantId,
  disabled,
  ...props
}: React.ComponentProps<typeof Button> & { productVariantId: number }) {
  const { mutate: addToCart, isPending: addingToCart } =
    api.user.carts.addItem.useMutation();
  const { mutate: removeFromCart, isPending: removingFromCart } =
    api.user.carts.removeItem.useMutation();
  const { data: cart } = api.user.carts.find.useQuery();
  const utils = api.useUtils();
  const currentCartItem = useMemo(
    () =>
      cart?.items.find((item) => item.productVariant?.id === productVariantId),
    [cart, productVariantId],
  );

  function handleAddToCart() {
    addToCart(
      { productVariantId },
      {
        onSuccess: () => void utils.user.carts.find.invalidate(),
      },
    );
  }

  function handleRemoveFromCart() {
    removeFromCart(
      { productVariantId },
      {
        onSuccess: () => void utils.user.carts.find.invalidate(),
      },
    );
  }

  function handleIncreaseQuantity() {
    addToCart(
      { productVariantId },
      {
        onSuccess: () => void utils.user.carts.find.invalidate(),
      },
    );
  }

  if (currentCartItem) {
    return (
      <div
        className={cn(
          "has-[>p:hover]:bg-accent relative flex size-full flex-1 items-center justify-between gap-3 rounded-lg border p-px transition-all has-[>p:hover]:cursor-not-allowed",
          removingFromCart ||
            (addingToCart && "pointer-events-none opacity-50"),
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={handleRemoveFromCart}
              disabled={removingFromCart}
              className="w-full flex-1"
            >
              <IconShoppingCartX />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove from Cart</TooltipContent>
        </Tooltip>

        <p className="text-sm font-medium">
          {currentCartItem.quantity} in cart
        </p>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={handleIncreaseQuantity}
              disabled={removingFromCart}
              className="w-full flex-1"
            >
              <IconShoppingCartPlus />
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
      disabled={addingToCart || disabled}
      {...props}
    >
      <IconShoppingCartPlus />
      Add to Cart
    </Button>
  );
}
