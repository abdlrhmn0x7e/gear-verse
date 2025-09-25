import { Button } from "~/components/ui/button";
import { IconBasketDollar } from "@tabler/icons-react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { Spinner } from "~/components/spinner";

export function BuyNowButton({
  productVariantId,
  disabled,
  ...props
}: React.ComponentProps<typeof Button> & { productVariantId: number }) {
  const { mutate: addItem, isPending: addingItem } =
    api.public.carts.addItem.useMutation();
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
