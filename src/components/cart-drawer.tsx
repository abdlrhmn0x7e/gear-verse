"use client";

import { IconShoppingBagX, IconShoppingCartCheck } from "@tabler/icons-react";
import { MinusIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useTRPC } from "~/trpc/client";
import { Button } from "./ui/button";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { JSX } from "react/jsx-dev-runtime";
import { useIsMobile } from "~/hooks/use-mobile";
import { cn } from "~/lib/utils";
import { formatCurrency } from "~/lib/utils/format-currency";
import { ImageWithFallback } from "./image-with-fallback";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import { Skeleton } from "./ui/skeleton";

export function CartDrawer({
  open,
  onOpenChange,
  Trigger,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  Trigger?: JSX.Element;
}) {
  const trpc = useTRPC();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const { data: cart, isPending: isPendingCart } = useQuery(
    trpc.public.carts.queries.find.queryOptions(),
  );
  const { mutate: removeItem, isPending: removingItem } = useMutation(
    trpc.public.carts.mutations.removeItem.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.public.carts.queries.find.queryKey(),
        });
        router.refresh();
      },
    }),
  );
  const { mutate: addItem, isPending: addingItem } = useMutation(
    trpc.public.carts.mutations.addItem.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.public.carts.queries.find.queryKey(),
        });
        router.refresh();
      },
    }),
  );

  useEffect(() => {
    onOpenChange?.(false);
  }, [pathname]);

  if (isPendingCart) {
    return <Skeleton className="size-9 rounded-full" />;
  }

  if (!cart) {
    return null;
  }

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={onOpenChange}
    >
      {Trigger}

      <DrawerContent className="sm:h-auto">
        <DrawerHeader>
          <DrawerTitle className="text-2xl font-bold">
            Shopping Cart
          </DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>

        <div className="space-y-3 divide-y px-4 [&>div]:pb-4">
          {cart.items.length > 0 ? (
            cart.items.map((item, idx) => (
              <div key={`cart-item-${idx}`} className="flex items-center gap-3">
                <ImageWithFallback
                  src={item.thumbnailUrl}
                  alt={item.title ?? `Product ${idx + 1}`}
                  className="size-24 shrink-0 rounded-md"
                  width={256}
                  height={256}
                />
                <div className="flex-1 space-y-1">
                  <p className="text-left text-sm font-medium">
                    {item.title} {item.values && `- ${item.values.join(", ")}`}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                      Total Amount
                    </p>
                    <p className="text-sm">
                      {formatCurrency((item.price ?? 0) * item.quantity)}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex w-full items-center gap-6 rounded-lg border p-1",
                      removingItem ||
                        (addingItem && "pointer-events-none opacity-50"),
                    )}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-1 md:size-6"
                      onClick={() =>
                        removeItem({
                          productId: item.productId,
                          productVariantId: item.productVariantId,
                        })
                      }
                      disabled={removingItem}
                    >
                      <MinusIcon className="size-4" />
                    </Button>
                    <p className="shrink-0 text-xs">{item.quantity}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-1 md:size-6"
                      onClick={() =>
                        addItem({
                          productId: item.productId,
                          productVariantId: item.productVariantId,
                        })
                      }
                      disabled={
                        addingItem ||
                        item.stock === 0 ||
                        (item.stock ?? 0) <= item.quantity
                      }
                    >
                      <PlusIcon className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <IconShoppingBagX size={64} />
              <p className="text-muted-foreground text-sm">
                Your cart is empty
              </p>
            </div>
          )}
        </div>

        <DrawerFooter>
          <Button variant="default" className="w-full" size="lg" asChild>
            <Link
              href="/checkout"
              className={cn(
                cart.items.length <= 0 && "pointer-events-none opacity-50",
              )}
            >
              <IconShoppingCartCheck className="size-4" />
              Proceed to Checkout
            </Link>
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
