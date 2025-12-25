"use client";

import { FileTextIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import type { ProductDraft } from "~/app/admin/_stores/draft";
import { cn } from "~/lib/utils";

type RestoreDraftDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  drafts: ProductDraft[];
  onSelectDraft: (draftId: string) => void;
  onStartFresh: () => void;
};

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

export function RestoreDraftDialog({
  open,
  onOpenChange,
  drafts,
  onSelectDraft,
  onStartFresh,
}: RestoreDraftDialogProps) {
  function handleSelectDraft(draftId: string) {
    onSelectDraft(draftId);
    onOpenChange(false);
  }

  function handleStartFresh() {
    onStartFresh();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>You have unsaved drafts</DialogTitle>
          <DialogDescription>
            Would you like to continue where you left off, or start fresh?
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm font-medium">
              Available drafts:
            </p>
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {drafts.map((draft) => (
                <button
                  key={draft.id}
                  type="button"
                  onClick={() => handleSelectDraft(draft.id)}
                  className={cn(
                    "hover:bg-accent flex w-full cursor-pointer items-center gap-3 rounded-md border p-3 text-left transition-colors",
                  )}
                >
                  <FileTextIcon className="text-muted-foreground size-5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{draft.name}</p>
                    <p className="text-muted-foreground truncate text-sm">
                      {draft.data.title || "Untitled product"} ·{" "}
                      {formatTimeAgo(draft.updatedAt)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleStartFresh}>
            Start Fresh
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
