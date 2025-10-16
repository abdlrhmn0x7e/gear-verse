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
import { useCartSearchParams } from "~/hooks/use-cart-search-params";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { useVariantSelectionStore } from "~/stores/variant-selection/provider";
import type { RouterOutputs } from "~/trpc/react";

export function AddToCartButton({
  disabled,
  product,
  ...props
}: React.ComponentProps<typeof Button> & {
  product: RouterOutputs["public"]["products"]["queries"]["findBySlug"];
}) {
  const utils = api.useUtils();
  const [, setParams] = useCartSearchParams();

  // Get variant data from store
  const variantId = useVariantSelectionStore((state) => state.variantId);
  const selectedOptions = useVariantSelectionStore(
    (state) => state.selectedOptions,
  );

  const { mutate: addToCart, isPending: addingToCart } =
    api.public.carts.mutations.addItem.useMutation();
  const { mutate: removeFromCart, isPending: removingFromCart } =
    api.public.carts.mutations.removeItem.useMutation();
  const { data: cart } = api.public.carts.queries.find.useQuery();

  // Find the selected variant from the product data
  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return null;

    // If there are options, find variant by selected options
    if (product.options && product.options.length > 0) {
      const exact = product.variants.find((v) =>
        Object.entries(selectedOptions).every(
          ([name, value]) => v.optionValues[name] === value,
        ),
      );
      return exact ?? product.variants[0];
    }

    // No options, use variantId or first variant
    return (
      product.variants.find((v) => v.id === variantId) ?? product.variants[0]
    );
  }, [product.variants, product.options, selectedOptions, variantId]);

  const currentCartItem = useMemo(
    () => cart?.items.find((item) => item.id === selectedVariant?.id),
    [cart, selectedVariant?.id],
  );

  const onSuccess = () => {
    void utils.public.carts.queries.find.invalidate();
  };

  function handleAddToCart() {
    if (!selectedVariant) return;
    addToCart(
      { productVariantId: selectedVariant.id },
      {
        onSuccess,
      },
    );
  }

  function handleRemoveFromCart(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    if (!selectedVariant) return;
    removeFromCart(
      { productVariantId: selectedVariant.id },
      {
        onSuccess,
      },
    );
  }

  function handleIncreaseQuantity(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    if (!selectedVariant) return;
    addToCart(
      { productVariantId: selectedVariant.id },
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
        onClick={() => void setParams({ cart: true })}
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
                !selectedVariant ||
                selectedVariant.stock === 0 ||
                selectedVariant.stock <= currentCartItem.quantity
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

  // Don't render if no variant is selected
  if (!selectedVariant) {
    return null;
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={addingToCart || disabled || selectedVariant.stock === 0}
      {...props}
    >
      <IconShoppingCartPlus />
      Add to Cart
    </Button>
  );
}
