"use client";

import { CheckIcon, Undo2Icon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

/**
 * Pinned to the bottom of the page while a form has something to save, so
 * saving is always one click away and a clean form has nothing to save. It
 * submits the form named by `form`; leave out `onDiscard` when there is
 * nothing to go back to.
 */
export function SaveBar({
  form,
  visible,
  saving,
  canSave = true,
  label = "Unsaved changes",
  saveLabel = "Save",
  onDiscard,
  className,
}: {
  /** The id of the form the save button submits. */
  form: string;
  visible: boolean;
  saving: boolean;
  canSave?: boolean;
  label?: string;
  saveLabel?: string;
  onDiscard?: () => void;
  /** Where the bar sits, when not pinned to the bottom of a scrolling page. */
  className?: string;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          data-slot="save-bar"
          // In a flex column taller than its content (a short list), mt-auto
          // keeps the bar at the bottom of the page instead of under the last row.
          className={cn(
            "sticky bottom-4 z-20 mt-auto flex justify-center",
            className,
          )}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <div
            role="region"
            aria-label={label}
            // The buttons would inherit the bar's elevation variable; they stay flat.
            className="surface-control surface-floating flex w-full max-w-xl items-center gap-3 rounded-full py-2 pr-2 pl-5 [--surface-shadow:var(--shadow-lg)] [&_[data-slot]]:[--surface-shadow:none]"
          >
            <p className="flex-1 text-sm font-medium">{label}</p>
            {onDiscard && (
              <Button
                type="button"
                variant="outline"
                onClick={onDiscard}
                disabled={saving}
              >
                <Undo2Icon />
                Discard
              </Button>
            )}
            <Button type="submit" form={form} disabled={saving || !canSave}>
              {saving ? <Spinner /> : <CheckIcon />}
              {saveLabel}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
