"use client";

import {
  useFormContext,
  useFormState,
  type UseFieldArrayMove,
} from "react-hook-form";

import { ImageIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { useMediaStore } from "../../../_stores/media/provider";
import type { SelectedMedia } from "../../../_stores/media/store";
import { MediaDialog } from "../../dialogs/media";

import {
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { rectSortingStrategy } from "@dnd-kit/sortable";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { Badge } from "~/components/ui/badge";
import type { ProductFormValues } from ".";
import {
  DragableContext,
  DragableSortableContext,
  SortableItem,
} from "../../dragable-context";

export function MediaFields({
  media,
  move,
}: {
  media: ProductFormValues["media"];
  move: UseFieldArrayMove;
}) {
  const setSelectedMedia = useMediaStore((state) => state.setSelectedMedia);

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [checkedIds, setCheckedIds] = useState<ReadonlySet<number>>(new Set());

  const { getValues, setValue, control } = useFormContext<ProductFormValues>();
  const { errors } = useFormState({ control, name: "media" });

  // The form owns the media and its order (the first is the thumbnail). The
  // store only backs the picker, so it is seeded from the form each time the
  // picker opens, and whatever comes back is merged into the form's order:
  // media still picked keep their places, new picks go on the end.
  function commitMedia(next: ProductFormValues["media"]) {
    setValue("media", next, { shouldDirty: true });
    setSelectedMedia(next);
    // media only come and go through here, so their ticks go with them
    setCheckedIds(
      (ids) => new Set(next.map((m) => m.mediaId).filter((id) => ids.has(id))),
    );
  }

  function handlePicked(picked: SelectedMedia[]) {
    const pickedIds = new Set(picked.map((m) => m.mediaId));
    const kept = getValues("media").filter((m) => pickedIds.has(m.mediaId));
    const keptIds = new Set(kept.map((m) => m.mediaId));
    const added = picked
      .filter((m) => !keptIds.has(m.mediaId))
      .map(({ mediaId, url }) => ({ mediaId, url }));

    commitMedia([...kept, ...added]);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = media.findIndex((m) => m.mediaId === active.id);
      const newIndex = media.findIndex((m) => m.mediaId === over?.id);

      if (oldIndex === -1 || newIndex === -1) return;

      move(oldIndex, newIndex);

      setActiveId(null);
    }
  }

  function handleCheckboxChange(mediaId: number) {
    return (checked: boolean) =>
      setCheckedIds((ids) => {
        const next = new Set(ids);
        if (checked) next.add(mediaId);
        else next.delete(mediaId);
        return next;
      });
  }

  return (
    <div className="space-y-2">
      {checkedIds.size > 0 ? (
        <div className="flex h-9 items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={checkedIds.size === media.length}
              indeterminate={checkedIds.size < media.length}
              onCheckedChange={(checked) =>
                setCheckedIds(
                  new Set(checked ? media.map((m) => m.mediaId) : []),
                )
              }
            />

            <Label htmlFor="select-all">{checkedIds.size} selected</Label>
          </div>

          <Button
            variant="destructive"
            size="sm"
            type="button"
            onClick={() => {
              commitMedia(
                getValues("media").filter((m) => !checkedIds.has(m.mediaId)),
              );
            }}
          >
            <Trash2Icon data-icon="inline-start" />
            Delete selected
          </Button>
        </div>
      ) : (
        <Label className="h-9">Media</Label>
      )}

      <div suppressHydrationWarning>
        <DragableContext
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
        >
          <DragableSortableContext
            items={media.map((m) => m.mediaId)}
            strategy={rectSortingStrategy}
          >
            <div className="relative flex flex-wrap gap-2">
              {media.map((m, index) => (
                <div
                  key={`${m.mediaId}-${index}-container`}
                  className="peer group relative"
                >
                  <SortableItem id={m.mediaId} className="size-32 rounded-lg">
                    <MediaItem
                      media={m}
                      className="transition-opacity duration-150 group-active:opacity-20"
                    />

                    <Checkbox
                      className="absolute top-2 left-2 z-10 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-0 data-checked:opacity-100"
                      checked={checkedIds.has(m.mediaId)}
                      onCheckedChange={handleCheckboxChange(m.mediaId)}
                      onPointerDown={(e) => e.stopPropagation()}
                    />
                  </SortableItem>
                </div>
              ))}

              <MediaDialog onChange={handlePicked}>
                <button
                  type="button"
                  aria-label="Add media"
                  onClick={() => setSelectedMedia(getValues("media"))}
                  className="hover:bg-muted flex size-32 cursor-pointer items-center justify-center rounded-lg border border-dashed p-2 transition-colors"
                >
                  <PlusIcon />
                </button>
              </MediaDialog>

              <Badge className="absolute top-24 left-6 z-10 peer-has-active:z-[9999]">
                <ImageIcon />
                Thumbnail
              </Badge>
            </div>
          </DragableSortableContext>

          <DragOverlay>
            {activeId ? (
              <MediaItem media={media.find((m) => m.mediaId === activeId)!} />
            ) : null}
          </DragOverlay>
        </DragableContext>
      </div>

      <p className="text-muted-foreground text-sm">
        The first media will be used as the main image.
      </p>

      {/* an error inside one media is about data the admin can't edit */}
      {errors.media && (
        <p className="text-destructive text-sm">
          {errors.media.message ??
            "One of these media couldn't be read. Remove it and add it again."}
        </p>
      )}
    </div>
  );
}

function MediaItem({
  media,
  className,
}: {
  media: ProductFormValues["media"][number];
  className?: string;
}) {
  return (
    <AspectRatio ratio={1} className="size-32">
      <div
        className={cn(
          "pointer-events-none size-full overflow-hidden rounded-md border bg-white select-none",
          className,
        )}
      >
        <Image
          src={media.url}
          alt={`Selected Media ${media.mediaId}`}
          width={256}
          height={256}
          className="size-full object-cover"
        />
      </div>
    </AspectRatio>
  );
}
