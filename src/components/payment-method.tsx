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
            <span>Cash on delivery</span>
          </div>
        );
      }

      return (
        <Badge variant="secondary">
          <HandCoinsIcon />
          Cash on delivery
        </Badge>
      );
    case "ONLINE":
      if (variant === "plain") {
        return (
          <div className="flex items-center gap-1">
            <CreditCardIcon />
            <span>Online payment</span>
          </div>
        );
      }

      return (
        <Badge variant="secondary">
          <CreditCardIcon />
          Online payment
        </Badge>
      );
  }
}
