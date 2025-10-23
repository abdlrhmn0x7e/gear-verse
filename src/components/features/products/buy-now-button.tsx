"use client";

import { Button } from "~/components/ui/button";
import { IconBasketDollar } from "@tabler/icons-react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { Spinner } from "~/components/spinner";
import { cn } from "~/lib/utils";
import { toast } from "sonner";
import { useVariantSelectionStore } from "~/stores/variant-selection/provider";
import type { RouterOutputs } from "~/trpc/react";
import Link from "next/link";
import { ArrowBigUpIcon } from "lucide-react";

export function BuyNowButton({
  disabled,
  className,
  product,
  ...props
}: React.ComponentProps<typeof Button> & {
  product: RouterOutputs["public"]["products"]["queries"]["findBySlug"];
}) {
  const selectedVariant = useVariantSelectionStore(
    (store) => store.selectedVariant,
  );
  const { data: cart } = api.public.carts.queries.find.useQuery();
  const { mutate: addItem, isPending: addingItem } =
    api.public.carts.mutations.addItem.useMutation({
      onError: () => {
        toast.warning("You can't buy and add an item at the same time!");
      },
    });
  const router = useRouter();

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
      disabled={addingItem ?? disabled ?? (selectedVariant?.stock ?? 0) <= 0}
      {...props}
    >
      {addingItem ? <Spinner /> : <IconBasketDollar />}
      Buy Now
    </Button>
  );
}
