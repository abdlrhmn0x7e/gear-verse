"use client";

import {
  DndContext,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type UniqueIdentifier,
  KeyboardSensor,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  type SortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon } from "lucide-react";

import { cn } from "~/lib/utils";

export function SwapableContext({
  items,
  strategy,
  children,
  ...props
}: {
  items: UniqueIdentifier[];
  strategy: SortingStrategy;
} & React.ComponentProps<typeof DndContext>) {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
        tolerance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 6,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 10,
        distance: 10,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      activationConstraint: {
        delay: 10,
        tolerance: 6,
      },
    }),
  );
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} {...props}>
      <SortableContext items={items} strategy={strategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

export function SwapableSortableContext({
  items,
  strategy,
  children,
}: React.PropsWithChildren<{
  items: UniqueIdentifier[];
  strategy: SortingStrategy;
}>) {
  return (
    <SortableContext items={items} strategy={strategy}>
      {children}
    </SortableContext>
  );
}

export function SwapableItem({
  id,
  className,
  children,
}: React.PropsWithChildren<{ id: number; className?: string }>) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className={cn("group relative focus-within:outline-none", className)}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

export function SwapableItemWithHandle({
  id,
  className,
  children,
  disabled = false,
}: React.PropsWithChildren<{
  id: UniqueIdentifier;
  className?: string;
  disabled?: boolean;
}>) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 focus-within:outline-none",
        className,
      )}
      ref={setNodeRef}
      style={style}
    >
      <button
        type="button"
        className="cursor-grab focus-within:outline-none active:cursor-grabbing disabled:cursor-default disabled:opacity-50"
        disabled={disabled}
        {...listeners}
        {...attributes}
      >
        <GripVerticalIcon className="size-4" />
      </button>

      <div className="flex-1">{children}</div>
    </div>
  );
}

export function SwapableDragOverlay({
  children,
  className,
  withHandle = false,
}: React.PropsWithChildren<{ className?: string; withHandle?: boolean }>) {
  return (
    <DragOverlay>
      <div
        className={cn(
          "group relative flex items-center gap-2 focus-within:outline-none",
          className,
        )}
      >
        {withHandle && (
          <button
            type="button"
            className="cursor-grab focus-within:outline-none active:cursor-grabbing"
          >
            <GripVerticalIcon className="size-4" />
          </button>
        )}

        <div className="flex-1">{children}</div>
      </div>
    </DragOverlay>
  );
}
