"use client";

import { ArrowRightIcon, LockIcon, ShoppingBagIcon } from "lucide-react";
import Link from "next/link";
import { useTRPC } from "~/trpc/client";
import { Button } from "./ui/button";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { JSX } from "react/jsx-dev-runtime";
import { useIsMobile } from "~/hooks/use-mobile";
import { formatCurrency } from "~/lib/utils/format-currency";
import { TRUST_PROMISES } from "./features/trust/trust-promises";
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
  const trpc = useTRPC();
  const router = useRouter();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const { data: cart, isPending: isPendingCart } = useQuery(
    trpc.public.carts.queries.find.queryOptions(),
  );
  const onSuccess = () => {
    void queryClient.invalidateQueries({
      queryKey: trpc.public.carts.queries.find.queryKey(),
    });
    router.refresh();
  };
  const { mutate: removeItem, isPending: removingItem } = useMutation(
    trpc.public.carts.mutations.removeItem.mutationOptions({ onSuccess }),
  );
  const { mutate: addItem, isPending: addingItem } = useMutation(
    trpc.public.carts.mutations.addItem.mutationOptions({ onSuccess }),
  );

  // without a session there is no cart; the button stays so the way to the cart never disappears
  const items = cart?.items ?? [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + (item.price ?? 0) * item.quantity,
    0,
  );
  const pending = removingItem || addingItem;

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={onOpenChange}
    >
      {Trigger ?? (
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={
              isPendingCart
                ? "Cart"
                : `Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`
            }
          >
            <ShoppingBagIcon />
            {itemCount > 0 && (
              <span className="bg-primary text-primary-foreground absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.6875rem] font-medium tabular-nums">
                {itemCount}
              </span>
            )}
          </Button>
        </DrawerTrigger>
      )}

      <DrawerContent className="p-6 sm:max-w-md">
        <DrawerHeader className="px-2 pt-2 md:text-left">
          <DrawerTitle className="text-title">Your cart</DrawerTitle>
          <DrawerDescription>
            {isPendingCart
              ? "Loading your cart…"
              : itemCount === 0
                ? "Nothing here yet."
                : `${itemCount} ${itemCount === 1 ? "item" : "items"}`}
          </DrawerDescription>
        </DrawerHeader>

        {isPendingCart ? (
          <div className="flex-1 divide-y px-2" aria-hidden>
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="flex gap-4 py-4">
                <Skeleton className="size-20 shrink-0 rounded-xl" />
                <div className="flex flex-1 flex-col gap-2 pt-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <ul className="min-h-0 flex-1 divide-y overflow-y-auto px-2">
            {items.map((item) => {
              const name = item.title ?? "this item";
              return (
                <li
                  key={`${item.productId}-${item.productVariantId}`}
                  className="flex gap-4 py-4"
                >
                  <div className="image-well size-20 shrink-0 overflow-hidden rounded-xl">
                    <ImageWithFallback
                      src={item.thumbnailUrl}
                      alt=""
                      className="size-full rounded-none border-none object-contain"
                      width={160}
                      height={160}
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-medium">
                          {item.title}
                        </p>
                        {item.values && item.values.length > 0 && (
                          <p className="text-muted-foreground text-sm capitalize">
                            {item.values.join(", ")}
                          </p>
                        )}
                      </div>
                      <p className="shrink-0 text-sm font-medium tabular-nums">
                        {formatCurrency((item.price ?? 0) * item.quantity)}
                      </p>
                    </div>

                    <QuantityStepper
                      quantity={item.quantity}
                      itemLabel={name}
                      pending={pending}
                      canIncrement={(item.stock ?? 0) > item.quantity}
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
                      className="self-start"
                    />
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
              <p className="font-medium">Your cart is empty</p>
              <p className="text-muted-foreground text-sm text-pretty">
                Hand-imported gear, delivered in Egypt in 1–2 business days.
              </p>
            </div>
            <DrawerClose asChild>
              <Button variant="outline" asChild>
                <Link href="/products">
                  Browse the store
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
            </DrawerClose>
          </div>
        )}

        {items.length > 0 && (
          <DrawerFooter className="gap-4 border-t px-2 pt-5 pb-2">
            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground text-sm">Subtotal</span>
              <span className="text-lg font-medium tabular-nums">
                {formatCurrency(subtotal)}
              </span>
            </div>

            <DrawerClose asChild>
              <Button size="xl" className="w-full" asChild>
                <Link href="/checkout">
                  <LockIcon data-icon="inline-start" />
                  Check out
                </Link>
              </Button>
            </DrawerClose>

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
