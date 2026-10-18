import { WhatsAppNumberLink } from "~/components/whatsapp-number-link";
import { cn } from "~/lib/utils";

/**
 * What happens after ordering, and the store's WhatsApp for questions with the
 * order number typed in. The confirmation line only applies while the order
 * is pending; without a number there's nothing to ask on, so that half goes.
 */
export function OrderContactNote({
  orderId,
  whatsappNumber,
  pending,
  className,
}: {
  orderId: number;
  whatsappNumber: string | null;
  pending: boolean;
  className?: string;
}) {
  if (!pending && !whatsappNumber) return null;

  return (
    <p className={cn("text-muted-foreground text-sm text-pretty", className)}>
      {pending &&
        "We'll contact you on WhatsApp or by phone to confirm your order and shipping fee."}
      {pending && whatsappNumber && " "}
      {whatsappNumber && (
        <>
          Questions? WhatsApp us at{" "}
          <WhatsAppNumberLink
            number={whatsappNumber}
            message={`Hi Gear Verse, I have a question about my order #${orderId}.`}
            className="text-foreground font-medium tabular-nums underline decoration-from-font underline-offset-4"
          />
          .
        </>
      )}
    </p>
  );
}
