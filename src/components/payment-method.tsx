import { Badge } from "~/components/ui/badge";
import { CreditCardIcon, HandCoinsIcon } from "lucide-react";

export function PaymentMethod({
  method,
  variant = "badge",
}: {
  method: "COD" | "ONLINE";
  variant?: "badge" | "plain";
}) {
  switch (method) {
    case "COD":
      if (variant === "plain") {
        return (
          <div className="flex items-center gap-1">
            <HandCoinsIcon />
            <span>Cash on Delivery</span>
          </div>
        );
      }

      return (
        <Badge variant="secondary">
          <HandCoinsIcon />
          Cash on Delivery
        </Badge>
      );
    case "ONLINE":
      if (variant === "plain") {
        return (
          <div className="flex items-center gap-1">
            <CreditCardIcon />
            <span>Online Payment</span>
          </div>
        );
      }

      return (
        <Badge variant="secondary">
          <CreditCardIcon />
          Online Payment
        </Badge>
      );
  }
}
