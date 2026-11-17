"use client";

import { IconBrandWhatsapp } from "@tabler/icons-react";
import { Button } from "~/components/ui/button";
import { CopyIconSwap, useCopyToClipboard } from "./copy-button";

/**
 * Opens a WhatsApp chat with the order's confirmation message typed in, and
 * copies the message for when the link won't do. The icon sizes drop the
 * labels, for table rows and toolbars.
 */
export function WhatsAppActions({
  confirmation,
  size = "sm",
}: {
  confirmation: { message: string; whatsApp: string | null };
  size?: "sm" | "icon" | "icon-sm";
}) {
  const { copied, copy } = useCopyToClipboard();
  const compact = size !== "sm";

  return (
    <>
      {confirmation.whatsApp && (
        <Button
          variant="outline"
          size={size}
          aria-label={compact ? "Send on WhatsApp" : undefined}
          title={compact ? "Send on WhatsApp" : undefined}
          nativeButton={false}
          render={
            <a
              href={confirmation.whatsApp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
            />
          }
        >
          <IconBrandWhatsapp data-icon="inline-start" />
          {!compact && "WhatsApp"}
        </Button>
      )}
      <Button
        variant="outline"
        size={size}
        aria-label={compact ? "Copy WhatsApp message" : undefined}
        title={compact ? "Copy WhatsApp message" : undefined}
        onClick={(event) => {
          event.stopPropagation();
          void copy(confirmation.message, {
            success: "Message copied",
            error: "Couldn't copy the message. Try again.",
          });
        }}
      >
        <CopyIconSwap copied={copied} />
        {!compact && "Copy message"}
      </Button>
    </>
  );
}
