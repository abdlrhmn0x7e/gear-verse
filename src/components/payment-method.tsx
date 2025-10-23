import { Badge } from "~/components/ui/badge";
import { HandCoinsIcon } from "lucide-react";

export function PaymentMethod({
  method,
  variant = "badge",
}: {
  method: "COD";
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
  }
}
