import { Button } from "~/components/ui/button";
import { IconBasketDollar } from "@tabler/icons-react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { Spinner } from "~/components/spinner";
import { ArrowBigUpIcon } from "lucide-react";
import Link from "next/link";

export function BuyNowButton({
  productVariantId,
  disabled,
  ...props
}: React.ComponentProps<typeof Button> & { productVariantId: number }) {
  const { data: cart } = api.public.carts.queries.find.useQuery();
  const { mutate: addItem, isPending: addingItem } =
    api.public.carts.mutations.addItem.useMutation();
  const router = useRouter();

  function handleClick() {
    addItem(
      {
        productVariantId,
      },
      {
        onSuccess: () => {
          router.push("/checkout");
        },
      },
    );
  }

  if (cart?.items.find((item) => item.id === productVariantId)) {
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
      className="w-full lg:flex-1"
      size="lg"
      onClick={handleClick}
      disabled={addingItem || disabled}
      {...props}
    >
      {addingItem ? <Spinner /> : <IconBasketDollar />}
      Buy Now
    </Button>
  );
}
