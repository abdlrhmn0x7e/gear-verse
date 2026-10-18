import { WhatsAppNumberLink } from "~/components/whatsapp-number-link";

export function OrdersHeading({
  whatsappNumber,
}: {
  whatsappNumber: string | null;
}) {
  return (
    <header className="space-y-2">
      <h1 className="text-headline-sm md:text-display-sm text-balance">
        Your orders
      </h1>
      <p className="text-muted-foreground text-pretty">
        Follow each order from our confirmation message to your door.
        {whatsappNumber && (
          <>
            {" "}
            Questions? WhatsApp us at{" "}
            <WhatsAppNumberLink
              number={whatsappNumber}
              message="Hi Gear Verse, I have a question about my order."
              className="text-foreground font-medium tabular-nums underline decoration-from-font underline-offset-4"
            />
            .
          </>
        )}
      </p>
    </header>
  );
}
