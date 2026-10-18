import type { ReactNode } from "react";
import { cn } from "~/lib/utils";
import { formatWhatsAppNumber, whatsAppLink } from "~/lib/whatsapp";

/**
 * The store's WhatsApp number written out, opening the chat when tapped.
 * `message` is typed into the chat for the customer to send.
 */
export function WhatsAppNumberLink({
  number,
  message,
  className,
  children,
}: {
  /** E.164, from the store settings. */
  number: string;
  message?: string;
  className?: string;
  /** shown before the number inside the link, e.g. an icon */
  children?: ReactNode;
}) {
  const formatted = formatWhatsAppNumber(number);

  return (
    <a
      href={whatsAppLink(number, message)}
      target="_blank"
      rel="noopener"
      aria-label={`WhatsApp ${formatted}`}
      className={cn(
        "focus-visible:outline-focus rounded-sm whitespace-nowrap outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
    >
      {children}
      <span dir="ltr">{formatted}</span>
    </a>
  );
}
