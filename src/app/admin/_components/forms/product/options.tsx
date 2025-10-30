"use client";

import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { InfoIcon, PlusCircleIcon, Trash2Icon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

import { type DragEndEvent, type UniqueIdentifier } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "motion/react";
import {
  DragableContext,
  DragableSortableContext,
  SortableItemWithHandle,
} from "../../dragable-context";

import type { ProductFormValues } from ".";
import { generateRandomId } from "~/lib/utils/generate-random-id";

export function Options() {
  const form = useFormContext<ProductFormValues>();
  const {
    fields: options,
    append,
    remove,
    swap,
  } = useFieldArray({
    control: form.control,
    name: "options",
    keyName: "keyId",
  });

  const [openOptions, setOpenOptions] = useState<UniqueIdentifier[]>([]);

  function toggleOpen(id: UniqueIdentifier) {
    setOpenOptions((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  function handleRemove(id: UniqueIdentifier) {
    if (options.length === 1) {
      form.resetField("inventory");
    }

    setOpenOptions((prev) => prev.filter((i) => i !== id));
    const optionIndex = options.findIndex((o) => o.id === id);
    if (optionIndex !== -1) {
      remove(optionIndex);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = options.findIndex((o) => o.keyId === active.id);
    const newIndex = options.findIndex((o) => o.keyId === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    swap(oldIndex, newIndex);
  }

  function handleAddOption() {
    if (options.length === 0) {
      form.setValue("inventory", undefined);
    }

    const newOptionId = generateRandomId();
    append({
      id: newOptionId,
      name: "",
      values: [
        {
          id: generateRandomId(),
          value: "",
        },
      ],
    });
    setOpenOptions((prev) => [...prev, newOptionId]);
  }

  if (options.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-muted-foreground flex flex-col items-center gap-2 text-center">
          <InfoIcon className="size-8" />
          <p className="max-w-sm text-sm text-pretty">
            Options are used to group variants. For example, color, size,
            connectivity, etc.
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={handleAddOption}>
          <PlusCircleIcon />
          Add Options like color, connectivity, etc.
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3" suppressHydrationWarning>
      <DragableContext
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <DragableSortableContext
          items={options.map((option) => option.keyId)}
          strategy={verticalListSortingStrategy}
        >
          {options.map((option, index) => (
            <SortableItemWithHandle
              key={option.keyId}
              id={option.keyId}
              disabled={openOptions.length > 0}
              className="bg-card items-start rounded-lg border pt-6 pr-2 pb-2 pl-4"
            >
              <Option
                optionId={option.id}
                index={index}
                open={openOptions.includes(option.id)}
                toggleOpen={() => toggleOpen(option.id)}
                remove={() => handleRemove(option.id)}
              />
            </SortableItemWithHandle>
          ))}
        </DragableSortableContext>
      </DragableContext>

      <Button type="button" variant="ghost" onClick={handleAddOption}>
        <PlusCircleIcon />
        Add Another Option
      </Button>
    </div>
  );
}

function Option({
  optionId,
  index,
  open,
  toggleOpen,
  remove,
}: {
  optionId: UniqueIdentifier;
  index: number;
  open: boolean;
  toggleOpen: () => void;
  remove: () => void;
}) {
  const form = useFormContext<ProductFormValues>();

  const watchedOption = useWatch({
    control: form.control,
    name: `options.${index}`,
  }) as ProductFormValues["options"][number] | undefined;

  const allOptions = form.getValues("options");
  const fallbackOption = Array.isArray(allOptions)
    ? (allOptions[index] as ProductFormValues["options"][number] | undefined)
    : undefined;

  const option =
    watchedOption ??
    fallbackOption ??
    ({ id: optionId, name: "", values: [] } as ProductFormValues["options"][number]);

  const optionName = option.name?.trim() ? option.name.trim() : "Untitled option";
  const optionValues = option.values ?? [];
  const previewValues = optionValues.filter((value) =>
    typeof value.value === "string" ? value.value.trim().length > 0 : false,
  );

  async function handleDone() {
    const isValid = await form.trigger(`options.${index}`);

    if (isValid) {
      toggleOpen();
    }
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {open ? (
        <motion.div
          key={`option-open-${optionId}`}
          className="space-y-4"
          initial={{ opacity: 0, y: 16, height: 100 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -16, height: "auto" }}
          transition={{ duration: 0.1, ease: "easeOut" }}
        >
          <OptionFields index={index} />

          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={remove}
            >
              Delete
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDone}
            >
              Done
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.button
          key={`option-closed-${optionId}`}
          type="button"
          onClick={toggleOpen}
          className="hover:bg-muted -mt-4 flex min-h-16 w-full flex-col items-start rounded-lg px-3 py-2 transition-colors"
          initial={{ opacity: 0, y: 16, height: 100 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -16, height: "auto" }}
          transition={{ duration: 0.1, ease: "easeOut" }}
        >
          <p className="font-medium">{optionName}</p>
          {previewValues.length > 0 ? (
            <div className="text-muted-foreground flex flex-wrap gap-1 text-sm">
              {previewValues.map((value) => (
                <Badge key={value.id} variant="outline">
                  {value.value}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No values yet</p>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function OptionFields({ index }: { index: number }) {
  const form = useFormContext<ProductFormValues>();

  const {
    fields: valueFields,
    append: appendValue,
    remove: removeValue,
    swap: swapValues,
  } = useFieldArray({
    control: form.control,
    name: `options.${index}.values`,
    keyName: "keyId",
  });

  function handleAddValue() {
    appendValue(
      {
        id: generateRandomId(),
        value: "",
      },
      { shouldFocus: true },
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = valueFields.findIndex((v) => v.keyId === active.id);
    const newIndex = valueFields.findIndex((v) => v.keyId === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    swapValues(oldIndex, newIndex);
  }

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={`options.${index}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Option Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="space-y-2">
        <Label>Option Values</Label>
        <div className="space-y-2" suppressHydrationWarning>
          {valueFields.length === 0 && (
            <p className="text-muted-foreground ml-6 text-sm">
              No values yet. Add one below.
            </p>
          )}
          <DragableContext
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <DragableSortableContext
              items={valueFields.map((value) => value.keyId)}
              strategy={verticalListSortingStrategy}
            >
              {valueFields.map((value, valueIndex) => (
                <SortableItemWithHandle
                  key={value.keyId}
                  id={value.keyId}
                >
                  <OptionValueField
                    optionIndex={index}
                    valueIndex={valueIndex}
                    canRemove={valueFields.length > 1}
                    onRemove={() => removeValue(valueIndex)}
                  />
                </SortableItemWithHandle>
              ))}
            </DragableSortableContext>

            <div className="ml-6">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={handleAddValue}
              >
                <PlusCircleIcon className="size-4" />
                Add Value
              </Button>
            </div>
          </DragableContext>
        </div>
      </div>
    </div>
  );
}

function OptionValueField({
  optionIndex,
  valueIndex,
  canRemove,
  onRemove,
  className,
}: {
  optionIndex: number;
  valueIndex: number;
  canRemove: boolean;
  onRemove: () => void;
  className?: string;
}) {
  const form = useFormContext<ProductFormValues>();

  return (
    <FormField
      control={form.control}
      name={`options.${optionIndex}.values.${valueIndex}.value`}
      render={({ field }) => (
        <FormItem className={cn("relative", className)}>
          <FormControl>
            <Input
              placeholder={
                valueIndex === 0 ? "Some Value" : "Add Another Value"
              }
              {...field}
            />
          </FormControl>

          {canRemove && (
            <button
              type="button"
              className="text-muted-foreground hover:text-destructive absolute top-1/2 right-2 size-6 -translate-y-1/2 cursor-pointer transition-colors"
              onClick={onRemove}
            >
              <Trash2Icon className="size-4" />
            </button>
          )}
        </FormItem>
      )}
    />
  );
}
