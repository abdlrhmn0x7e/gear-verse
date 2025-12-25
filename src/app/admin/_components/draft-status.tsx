"use client";

import { CloudIcon, Loader2Icon } from "lucide-react";
import { cn } from "~/lib/utils";

type DraftStatusProps = {
  lastSaved: Date | null;
  isSaving: boolean;
  isHydrated: boolean;
};

function formatLastSaved(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export function DraftStatus({
  lastSaved,
  isSaving,
  isHydrated,
}: DraftStatusProps) {
  if (!isHydrated) {
    return null;
  }

  return (
    <div
      className={cn(
        "text-muted-foreground flex items-center gap-1.5 text-xs transition-opacity",
        isSaving && "animate-pulse",
      )}
    >
      {isSaving ? (
        <>
          <Loader2Icon className="size-3 animate-spin" />
          <span>Saving...</span>
        </>
      ) : lastSaved ? (
        <>
          <CloudIcon className="size-3" />
          <span>Saved {formatLastSaved(lastSaved)}</span>
        </>
      ) : null}
    </div>
  );
}
