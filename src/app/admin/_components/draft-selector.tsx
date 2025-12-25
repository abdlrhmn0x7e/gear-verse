"use client";

import { useState } from "react";
import {
  ChevronDownIcon,
  FileTextIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import type { ProductDraft } from "~/app/admin/_stores/draft";
import { cn } from "~/lib/utils";

type DraftSelectorProps = {
  drafts: ProductDraft[];
  activeDraft: ProductDraft | null;
  onSelectDraft: (draftId: string) => void;
  onCreateDraft: () => void;
  onDeleteDraft: (draftId: string) => void;
  onRenameDraft: (draftId: string, name: string) => void;
  isHydrated: boolean;
};

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function DraftSelector({
  drafts,
  activeDraft,
  onSelectDraft,
  onCreateDraft,
  onDeleteDraft,
  onRenameDraft,
}: DraftSelectorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function handleStartRename(e: React.MouseEvent, draft: ProductDraft) {
    e.stopPropagation();
    e.preventDefault();
    setEditingId(draft.id);
    setEditName(draft.name);
  }

  function handleFinishRename(draftId: string) {
    if (editName.trim()) {
      onRenameDraft(draftId, editName.trim());
    }
    setEditingId(null);
    setEditName("");
  }

  function handleKeyDown(e: React.KeyboardEvent, draftId: string) {
    if (e.key === "Enter") {
      handleFinishRename(draftId);
    } else if (e.key === "Escape") {
      setEditingId(null);
      setEditName("");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          suppressHydrationWarning
        >
          <FileTextIcon className="size-4" />
          Drafts
          <ChevronDownIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Your Drafts</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {drafts.length === 0 ? (
          <div className="text-muted-foreground px-2 py-4 text-center text-sm">
            No drafts yet. Start typing to auto-save.
          </div>
        ) : (
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className={cn(
                  "hover:bg-accent group flex items-center gap-2 rounded-sm px-2 py-1.5",
                  activeDraft?.id === draft.id && "bg-accent",
                )}
              >
                {editingId === draft.id ? (
                  <div className="flex flex-1 items-center gap-1">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, draft.id)}
                      onBlur={() => handleFinishRename(draft.id)}
                      className="h-7 text-sm"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFinishRename(draft.id);
                      }}
                    >
                      <CheckIcon className="size-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onSelectDraft(draft.id)}
                      className="flex flex-1 cursor-pointer flex-col items-start"
                    >
                      <span className="text-sm font-medium">{draft.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {formatTimeAgo(draft.updatedAt)}
                        {draft.data.title &&
                          ` · ${draft.data.title.slice(0, 20)}${draft.data.title.length > 20 ? "..." : ""}`}
                      </span>
                    </button>
                    <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => handleStartRename(e, draft)}
                      >
                        <PencilIcon className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDraft(draft.id);
                        }}
                      >
                        <TrashIcon className="size-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onCreateDraft}>
          <PlusIcon className="size-4" />
          New Draft
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
