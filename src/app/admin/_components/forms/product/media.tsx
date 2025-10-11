"use client";

import { useFormContext, type UseFieldArraySwap } from "react-hook-form";

import { ImageIcon, PlusIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { useMediaStore } from "../../../_stores/media/provider";
import { MediaDialog } from "../../dialogs/media";

import {
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { rectSwappingStrategy } from "@dnd-kit/sortable";
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
  swap,
}: {
  media: ProductFormValues["media"];
  swap: UseFieldArraySwap;
}) {
  const selectedMedia = useMediaStore((state) => state.selectedMedia);
  const setSelectedMedia = useMediaStore((state) => state.setSelectedMedia);

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [checkedMedia, setCheckedMedia] = useState<ProductFormValues["media"]>(
    [],
  );

  const { setValue } = useFormContext<ProductFormValues>();

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = media.findIndex((m) => m.mediaId === active.id);
      const newIndex = media.findIndex((m) => m.mediaId === over?.id);

      if (oldIndex === -1 || newIndex === -1) return;

      swap(oldIndex, newIndex);

      setActiveId(null);
    }
  }

  function handleCheckboxChange(media: ProductFormValues["media"][number]) {
    return (checked: boolean) =>
      setCheckedMedia((prev) =>
        checked
          ? [...prev, media]
          : prev.filter((m) => m.mediaId !== media.mediaId),
      );
  }

  return (
    <div className="space-y-2">
      {checkedMedia.length > 0 ? (
        <div className="flex h-9 items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={
                checkedMedia.length === media.length
                  ? true
                  : checkedMedia.length === 0
                    ? false
                    : "indeterminate"
              }
              onCheckedChange={(checked) => {
                if (checked) {
                  setCheckedMedia(selectedMedia);
                } else {
                  setCheckedMedia([]);
                }
              }}
            />

            <Label htmlFor="select-all">{checkedMedia.length} selected</Label>
          </div>

          <Button
            variant="destructive"
            size="sm"
            type="button"
            onClick={() => {
              const newMedia = selectedMedia.filter(
                (m) => !checkedMedia.some((m2) => m2.mediaId === m.mediaId),
              );
              setSelectedMedia(newMedia);
              setValue("media", newMedia);
            }}
          >
            <TrashIcon />
            Delete Selected
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
            strategy={rectSwappingStrategy}
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
                      className="transition-opacity duration-1000 group-active:opacity-20"
                    />

                    <Checkbox
                      className="absolute top-2 left-2 z-10 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-0 data-[state=checked]:opacity-100"
                      checked={checkedMedia.some(
                        (m2) => m2.mediaId === m.mediaId,
                      )}
                      onCheckedChange={handleCheckboxChange(m)}
                      onPointerDown={(e) => e.stopPropagation()}
                    />
                  </SortableItem>
                </div>
              ))}

              <MediaDialog onChange={() => setValue("media", selectedMedia)}>
                <button
                  type="button"
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
          "pointer-events-none size-full overflow-hidden rounded-md border select-none",
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
