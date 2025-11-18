import { IconCreditCard } from "@tabler/icons-react";
import { HandCoinsIcon } from "lucide-react";

export function PaymentMethod({ paymentMethod }: { paymentMethod: string }) {
  switch (paymentMethod) {
    case "COD":
      return (
        <div className="flex items-center gap-2">
          <HandCoinsIcon className="size-4" />
          <p>Cash on Delivery</p>
        </div>
      );

    case "ONLINE":
      return (
        <div className="flex items-center gap-2">
          <IconCreditCard className="size-4" />
          <p>Online</p>
        </div>
      );
    default:
      return "Unknown";
  }
}
