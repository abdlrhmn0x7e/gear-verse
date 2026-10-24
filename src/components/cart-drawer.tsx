"use client";

import { ArrowRightIcon, LockIcon, ShoppingBagIcon, XIcon } from "lucide-react";
import { Link, useRouter } from "~/i18n/navigation";
import { useTRPC } from "~/trpc/client";
import { Button } from "./ui/button";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "~/components/ui/toast";
import type { JSX } from "react/jsx-dev-runtime";
import { useState } from "react";
import { useCloseOnBack } from "~/hooks/use-close-on-back";
import { useIsMobile } from "~/hooks/use-mobile";
import { blocksCheckout } from "~/lib/utils/cart-stock";
import { useCustomerErrorMessage } from "~/lib/utils/customer-error-message";
import { formatCurrency } from "~/lib/utils/format-currency";
import { TRUST_PROMISES } from "./features/trust/trust-promises";
import { CartStockNotice } from "./cart-stock-notice";
import { ImageWithFallback } from "./image-with-fallback";
import { QuantityStepper } from "./quantity-stepper";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Skeleton } from "./ui/skeleton";
import { useLocale, useTranslations } from "next-intl";

export function CartDrawer({
  open,
  onOpenChange,
  Trigger,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** defaults to the navbar cart button with the item count */
  Trigger?: JSX.Element;
}) {
  const locale = useLocale();
  const t = useTranslations("nav");
  const tCart = useTranslations("cart");
  const getErrorMessage = useCustomerErrorMessage();
  const trpc = useTRPC();
  const router = useRouter();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // the navbar's cart opens itself; other callers control it
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = open ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    if (open === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };
  useCloseOnBack(isOpen, () => setOpen(false));

  const { data: cart, isPending: isPendingCart } = useQuery(
    trpc.public.carts.queries.find.queryOptions(),
  );
  const onSuccess = () => {
    void queryClient.invalidateQueries({
      queryKey: trpc.public.carts.queries.find.queryKey(),
    });
    router.refresh();
  };
  const onError = (error: Parameters<typeof getErrorMessage>[0]) => {
    toast.error(getErrorMessage(error, tCart("updateError")));
  };
  const { mutate: removeItem, isPending: removingItem } = useMutation(
    trpc.public.carts.mutations.removeItem.mutationOptions({
      onSuccess,
      onError,
    }),
  );
  const { mutate: addItem, isPending: addingItem } = useMutation(
    trpc.public.carts.mutations.addItem.mutationOptions({ onSuccess, onError }),
  );

  // without a session there is no cart; the button stays so the way to the cart never disappears
  const items = cart?.items ?? [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + (item.price ?? 0) * item.quantity,
    0,
  );
  const pending = removingItem || addingItem;
  // checkout would fail on these lines, so the way there stays shut until each one is fixed
  const hasStockIssues = items.some(blocksCheckout);

  return (
    <Drawer
      swipeDirection={isMobile ? "down" : "right"}
      open={isOpen}
      onOpenChange={setOpen}
    >
      {Trigger ?? (
        <DrawerTrigger
          render={
            <Button
              variant="ghost"
              size="icon-lg"
              aria-label={
                isPendingCart
                  ? t("cart")
                  : t("cartWithCount", { count: itemCount })
              }
            />
          }
        >
          <ShoppingBagIcon />
          {itemCount > 0 && (
            <span className="bg-primary text-primary-foreground absolute end-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.6875rem] font-medium tabular-nums">
              {itemCount}
            </span>
          )}
        </DrawerTrigger>
      )}

      <DrawerContent className="p-6">
        <DrawerHeader className="relative px-2 pt-2 md:text-start">
          {/* a side drawer has no handle to swipe, so it needs a visible way out */}
          {!isMobile && (
            <DrawerClose
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={tCart("close")}
                  className="absolute end-0 top-1"
                />
              }
            >
              <XIcon />
            </DrawerClose>
          )}
          <DrawerTitle className="text-title">{tCart("title")}</DrawerTitle>
          <DrawerDescription>
            {isPendingCart
              ? tCart("loading")
              : tCart("count", { count: itemCount })}
          </DrawerDescription>
        </DrawerHeader>

        {isPendingCart ? (
          <div className="flex-1 divide-y px-2" aria-hidden>
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex gap-4 py-4">
                <Skeleton className="size-16 shrink-0 rounded-xl sm:size-20" />
                <div className="flex flex-1 flex-col gap-2 pt-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <ul className="scroll-fade min-h-0 flex-1 divide-y overflow-y-auto px-2">
            {items.map((item) => {
              const name = item.title ?? tCart("itemFallback");
              return (
                <li
                  key={`${item.productId}-${item.productVariantId}`}
                  className="flex gap-4 py-4"
                >
                  <div className="image-well outline-image-outline size-16 shrink-0 overflow-hidden rounded-xl outline-1 -outline-offset-1 sm:size-20">
                    <ImageWithFallback
                      src={item.thumbnailUrl}
                      alt=""
                      className="size-full rounded-none border-none object-contain"
                      width={160}
                      height={160}
                    />
                  </div>

                  {/* the price sits on the stepper row so the title gets the full width, even on a phone */}
                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-medium">
                        <bdi>{item.title}</bdi>
                      </p>
                      {item.values && item.values.length > 0 && (
                        <p className="text-muted-foreground text-sm capitalize">
                          <bdi>{item.values.join(", ")}</bdi>
                        </p>
                      )}
                      <CartStockNotice item={item} className="mt-1" />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <QuantityStepper
                        quantity={item.quantity}
                        itemLabel={name}
                        pending={pending}
                        canIncrement={
                          item.allowBackorder ||
                          (item.stock ?? 0) > item.quantity
                        }
                        onDecrement={() =>
                          removeItem({
                            productId: item.productId,
                            productVariantId: item.productVariantId,
                          })
                        }
                        onIncrement={() =>
                          addItem({
                            productId: item.productId,
                            productVariantId: item.productVariantId,
                          })
                        }
                      />
                      <p className="text-sm font-medium tabular-nums">
                        {formatCurrency(
                          (item.price ?? 0) * item.quantity,
                          locale,
                        )}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-2 py-16 text-center">
            <ShoppingBagIcon
              className="text-muted-foreground size-10"
              strokeWidth={1.5}
              aria-hidden
            />
            <div className="space-y-1">
              <p className="font-medium">{tCart("empty.title")}</p>
              <p className="text-muted-foreground text-sm text-pretty">
                {tCart("empty.description")}
              </p>
            </div>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/products" onClick={() => setOpen(false)} />}
            >
              {tCart("empty.browse")}
              <ArrowRightIcon
                data-icon="inline-end"
                className="rtl:-scale-x-100"
              />
            </Button>
          </div>
        )}

        {items.length > 0 && (
          <DrawerFooter className="mx-2 gap-4 border-t px-0 pt-5 pb-2">
            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground text-sm">
                {tCart("subtotal")}
              </span>
              <span className="text-lg font-medium tabular-nums">
                {formatCurrency(subtotal, locale)}
              </span>
            </div>

            {hasStockIssues ? (
              <>
                <p className="text-muted-foreground text-sm text-pretty">
                  {tCart("fixToCheckout")}
                </p>
                <Button size="xl" className="w-full" disabled>
                  <LockIcon data-icon="inline-start" />
                  {tCart("checkout")}
                </Button>
              </>
            ) : (
              <Button
                size="xl"
                className="w-full"
                nativeButton={false}
                render={
                  <Link href="/checkout" onClick={() => setOpen(false)} />
                }
              >
                <LockIcon data-icon="inline-start" />
                {tCart("checkout")}
              </Button>
            )}

            <ul className="text-muted-foreground flex flex-col gap-2 text-sm">
              {TRUST_PROMISES.map((promise) => (
                <li key={promise.title} className="flex items-center gap-2">
                  <promise.icon
                    className="size-4 shrink-0"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  {promise.title}
                </li>
              ))}
            </ul>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
