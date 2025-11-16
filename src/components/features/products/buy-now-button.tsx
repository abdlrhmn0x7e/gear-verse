"use client";

import { Button } from "~/components/ui/button";
import { IconBasketDollar } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Spinner } from "~/components/spinner";
import { cn } from "~/lib/utils";
import { toast } from "sonner";
import { useVariantSelectionStore } from "~/stores/variant-selection/provider";
import Link from "next/link";
import { ArrowBigUpIcon } from "lucide-react";
import { useTRPC, type RouterOutput } from "~/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";

export function BuyNowButton({
  className,
  product,
  ...props
}: React.ComponentProps<typeof Button> & {
  product: RouterOutput["public"]["products"]["queries"]["findBySlug"];
}) {
  const trpc = useTRPC();
  const router = useRouter();
  const selectedVariant = useVariantSelectionStore(
    (store) => store.selectedVariant,
  );
  const { data: cart } = useQuery(
    trpc.public.carts.queries.find.queryOptions(),
  );
  const { mutate: addItem, isPending: addingItem } = useMutation(
    trpc.public.carts.mutations.addItem.mutationOptions({
      onSuccess: () => {
        router.push("/checkout");
      },
      onError: () => {
        toast.warning("You can't buy and add an item at the same time!");
      },
    }),
  );

  function handleClick() {
    if (!selectedVariant) return;
    addItem(
      {
        productId: product.id,
        productVariantId: selectedVariant.id ?? null,
      },
      {
        onSuccess: () => {
          router.push("/checkout");
        },
      },
    );
  }

  if (
    cart?.items.find((item) => item.productVariantId === selectedVariant?.id)
  ) {
    return (
      <Button className="w-full lg:flex-1" size="lg" asChild {...props}>
        <Link href="/checkout">
          <ArrowBigUpIcon />
          Checkout
        </Link>
      </Button>
    );
  }

  return (
    <Button
      className={cn("w-full lg:flex-1", className)}
      size="lg"
      onClick={handleClick}
      // disabled={addingItem || (selectedVariant?.stock ?? 0) <= 0}
      {...props}
    >
      {addingItem ? <Spinner /> : <IconBasketDollar />}
      Buy Now
    </Button>
  );
}
