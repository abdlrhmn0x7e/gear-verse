"use client";

import { IconShoppingBagPlus } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "~/components/ui/toast";
import { QuantityStepper } from "~/components/quantity-stepper";
import { Button } from "~/components/ui/button";
import { useVariantSelectionStore } from "~/stores/variant-selection/provider";
import { getCustomerErrorMessage } from "~/lib/utils/customer-error-message";
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
  const t = useTranslations("products.purchase");
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [cartOpen, setCartOpen] = useState(false);
  const variantId = useVariantSelectionStore(
    (state) => state.selectedVariant?.id,
  );

  const onSuccess = () => {
    void queryClient.invalidateQueries({
      queryKey: trpc.public.carts.queries.find.queryKey(),
    });
  };
  const onError = (error: Parameters<typeof getCustomerErrorMessage>[0]) => {
    toast.error(getCustomerErrorMessage(error, t("cartError")));
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

  // one drawer for both states: removing the last unit from inside it swaps
  // the buttons, and a drawer that lived in the line branch vanished with them
  return (
    <>
      {line ? (
        <div className="flex gap-3">
          <QuantityStepper
            quantity={line.quantity}
            itemLabel={productTitle}
            pending={addingToCart || removingFromCart}
            canIncrement={line.allowBackorder || line.stock > line.quantity}
            onDecrement={() => removeFromCart(item)}
            onIncrement={() => addToCart(item)}
            className="h-12 px-1"
          />
          <Button
            variant="outline"
            size="xl"
            className="flex-1"
            aria-haspopup="dialog"
            aria-expanded={cartOpen}
            onClick={() => setCartOpen(true)}
          >
            {t("viewCart")}
            <ArrowRightIcon
              data-icon="inline-end"
              className="rtl:-scale-x-100"
            />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="xl"
          className="w-full"
          onClick={() => addToCart(item)}
          disabled={addingToCart || disabled}
        >
          <IconShoppingBagPlus data-icon="inline-start" />
          {t("addToCart")}
        </Button>
      )}
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} Trigger={<></>} />
    </>
  );
}
