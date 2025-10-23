"use client";

import { IconShoppingCart, IconShoppingCartPlus } from "@tabler/icons-react";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { useVariantSelectionStore } from "~/stores/variant-selection/provider";
import { CartDrawer } from "../../cart-drawer";

export function AddToCartButton({
  disabled,
  productId,
  stock,
  ...props
}: React.ComponentProps<typeof Button> & {
  productId: number;
  stock: number;
}) {
  const [openCartDrawer, setOpenCartDrawer] = useState(false);
  const utils = api.useUtils();

  // Get variant data from store
  const variantId = useVariantSelectionStore(
    (state) => state.selectedVariant,
  )?.id;

  const { mutate: addToCart, isPending: addingToCart } =
    api.public.carts.mutations.addItem.useMutation();
  const { mutate: removeFromCart, isPending: removingFromCart } =
    api.public.carts.mutations.removeItem.useMutation();
  const { data: cart } = api.public.carts.queries.find.useQuery();

  const currentCartItem = useMemo(
    () =>
      cart?.items.find(
        (item) => item.id === variantId || item.productId === productId,
      ),
    [cart, variantId, productId],
  );

  const onSuccess = () => {
    void utils.public.carts.queries.find.invalidate();
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
          removingFromCart ||
            (addingToCart && "pointer-events-none opacity-50"),
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

        <div className="flex items-center gap-2">
          <IconShoppingCart className="size-4" />

          <p className="text-sm font-medium">
            {currentCartItem.quantity} in cart
          </p>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={handleIncreaseQuantity}
              disabled={
                removingFromCart ||
                stock === 0 ||
                stock <= currentCartItem.quantity
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
    <>
      <Button
        onClick={handleAddToCart}
        disabled={addingToCart ?? disabled ?? stock <= 0}
        {...props}
      >
        <IconShoppingCartPlus />
        Add to Cart
      </Button>

      {cart && (
        <CartDrawer
          open={openCartDrawer}
          onOpenChange={setOpenCartDrawer}
          cart={cart}
        />
      )}
    </>
  );
}
