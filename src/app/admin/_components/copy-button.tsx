"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { toast } from "~/components/ui/toast";

/**
 * Writes text to the clipboard and toasts the outcome. `copied` stays true for
 * two seconds after a successful copy so a button can show a check.
 */
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timeout.current), []);

  const copy = useCallback(
    async (text: string, messages: { success: string; error: string }) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        toast.error(messages.error);
        return false;
      }

      toast.success(messages.success);
      setCopied(true);
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setCopied(false), 2000);
      return true;
    },
    [],
  );

  return { copied, copy };
}

/** The copy icon, swapped for a check while `copied`; the new icon fades and scales in. */
export function CopyIconSwap({ copied }: { copied: boolean }) {
  const Icon = copied ? CheckIcon : CopyIcon;
  return (
    <Icon
      key={String(copied)}
      data-icon="inline-start"
      className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-150 motion-safe:ease-out"
    />
  );
}

/** A small ghost icon button that copies `text`; `label` names it for screen readers ("Copy phone number"). */
export function CopyButton({
  text,
  label,
  success,
}: {
  text: string;
  label: string;
  success: string;
}) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label={label}
      title={label}
      onClick={() =>
        void copy(text, {
          success,
          error: "Couldn't copy. Select the text and copy it instead.",
        })
      }
    >
      <CopyIconSwap copied={copied} />
    </Button>
  );
}
