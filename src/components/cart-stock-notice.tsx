"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MinusIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "~/i18n/navigation";
import { useState } from "react";
import { toast } from "~/components/ui/toast";
import { cn } from "~/lib/utils";
import { BACKORDER_LEAD_DAYS, getStockIssue } from "~/lib/utils/cart-stock";
import { useTRPC } from "~/trpc/client";
import { Spinner } from "./spinner";
import { Button } from "./ui/button";

/** Flags a cart line that can't be bought as is and offers the fix: remove it when none is left, or bring it down to what
 *  is left. The cart only removes one unit per call, so the fix repeats it. A backorder line can be bought, so it only
 *  says how many units wait on sourcing. */
export function CartStockNotice({
  item,
  className,
}: {
  item: {
    productId: number;
    productVariantId: number | null;
    quantity: number;
    stock: number | null;
    allowBackorder: boolean;
  };
  className?: string;
}) {
  const t = useTranslations("cart.stock");
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);
  const { mutateAsync: removeOne } = useMutation(
    trpc.public.carts.mutations.removeItem.mutationOptions(),
  );

  const issue = getStockIssue(item);
  if (!issue) return null;

  const stock = item.stock ?? 0;

  if (issue === "backorder") {
    return (
      <p className={cn("text-muted-foreground text-sm text-pretty", className)}>
        {t.rich(stock > 0 ? "backorderPartial" : "backorderAll", {
          stock,
          backorder: item.quantity - stock,
          days: BACKORDER_LEAD_DAYS,
          strong: (chunks) => (
            <span className="text-foreground font-medium">{chunks}</span>
          ),
        })}
      </p>
    );
  }

  async function fix() {
    setPending(true);
    try {
      const excess = issue === "out" ? item.quantity : item.quantity - stock;
      for (let i = 0; i < excess; i++) {
        await removeOne({
          productId: item.productId,
          productVariantId: item.productVariantId,
        });
      }
    } catch {
      toast.error(t("fixError"));
    } finally {
      await queryClient.invalidateQueries({
        queryKey: trpc.public.carts.queries.find.queryKey(),
      });
      router.refresh();
      setPending(false);
    }
  }

  const Icon = issue === "out" ? Trash2Icon : MinusIcon;

  return (
    <div
      className={cn("flex flex-wrap items-center gap-x-3 gap-y-1", className)}
    >
      <p className="text-destructive text-sm font-medium">
        {issue === "out" ? t("out") : t("short", { stock })}
      </p>
      <Button
        type="button"
        variant="outline"
        size="xs"
        onClick={fix}
        disabled={pending}
      >
        {pending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <Icon data-icon="inline-start" />
        )}
        {issue === "out" ? t("remove") : t("changeTo", { stock })}
      </Button>
    </div>
  );
}
