"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LockIcon, ZapIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "~/i18n/navigation";
import { toast } from "~/components/ui/toast";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useVariantSelectionStore } from "~/stores/variant-selection/provider";
import { useCustomerErrorMessage } from "~/lib/utils/customer-error-message";
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
  const t = useTranslations("products.purchase");
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const getErrorMessage = useCustomerErrorMessage();
  const selectedVariant = useVariantSelectionStore(
    (store) => store.selectedVariant,
  );
  const { data: cart } = useQuery(
    trpc.public.carts.queries.find.queryOptions(),
  );
  const { mutate: addItem, isPending: addingItem } = useMutation(
    trpc.public.carts.mutations.addItem.mutationOptions({
      onSuccess: () => {
        // the navbar badge and cart drawer read this query, so they'd otherwise show the cart from before
        void queryClient.invalidateQueries({
          queryKey: trpc.public.carts.queries.find.queryKey(),
        });
        router.push("/checkout");
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, t("checkoutError")));
      },
    }),
  );

  if (findCartLine(cart, productId, selectedVariant?.id)) {
    return (
      <Button
        size={size}
        className={cn("w-full", className)}
        nativeButton={false}
        render={<Link href="/checkout" />}
      >
        <LockIcon data-icon="inline-start" />
        {t("checkOut")}
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
      {addingItem ? (
        <Spinner data-icon="inline-start" />
      ) : (
        !disabled && <ZapIcon data-icon="inline-start" />
      )}
      {disabled ? disabledLabel : t("buyNow")}
    </Button>
  );
}
