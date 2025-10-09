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
  pointerWithin,
  DragOverlay,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  type SortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripIcon, GripVerticalIcon } from "lucide-react";
import { useEffect, useId } from "react";

import { cn } from "~/lib/utils";

export function DragableContext({
  children,
  ...props
}: React.ComponentProps<typeof DndContext>) {
  // ssr fix
  const id = useId();

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
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={pointerWithin}
      {...props}
    >
      {children}
    </DndContext>
  );
}

export function DragableSortableContext({
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

export function DragableItem({
  id,
  className,
  children,
}: React.PropsWithChildren<{ id: number; className?: string }>) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group relative h-fit focus-within:outline-none",
        className,
      )}
    >
      <button
        className="cursor-grab focus-within:outline-none active:cursor-grabbing"
        {...listeners}
        {...attributes}
      >
        <GripIcon className="size-4" />
      </button>

      {children}
    </div>
  );
}

export function SortableItem({
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

export function SortableItemWithHandle({
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

export function DragableOverlay({
  children,
  className,
  vertical = false,
  withHandle = false,
  isDropping = false,
}: React.PropsWithChildren<{
  className?: string;
  withHandle?: boolean;
  vertical?: boolean;
  isDropping?: boolean;
}>) {
  return (
    <DragOverlay dropAnimation={null}>
      <div
        data-overlay
        data-dropping={isDropping ? "" : undefined}
        className={cn(
          "group relative flex items-center gap-2 transition duration-200 ease-out focus-within:outline-none data-[dropping]:scale-90 data-[dropping]:opacity-0",
          className,
        )}
      >
        {withHandle && (
          <button
            type="button"
            className="cursor-grab focus-within:outline-none active:cursor-grabbing"
          >
            {vertical ? (
              <GripVerticalIcon className="size-4" />
            ) : (
              <GripIcon className="size-4" />
            )}
          </button>
        )}

        <div className="flex-1">{children}</div>
      </div>
    </DragOverlay>
  );
}

export function Droppable({
  children,
  id,
  className,
  classNameWhenOver = "bg-accent",
  onOverChange,
}: React.PropsWithChildren<{
  id: string;
  className?: string;
  classNameWhenOver?: string;
  onOverChange?: (isOver: boolean) => void;
}>) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  useEffect(() => {
    onOverChange?.(isOver);
  }, [isOver, onOverChange]);

  return (
    <div
      ref={setNodeRef}
      className={cn(className, isOver && classNameWhenOver)}
      data-over={isOver ? "" : undefined}
      data-droppable-id={id}
    >
      {children}
    </div>
  );
}
