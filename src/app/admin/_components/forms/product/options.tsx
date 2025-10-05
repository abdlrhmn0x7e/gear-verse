"use client";

import {
  useFieldArray,
  useFormContext,
  type FieldArrayWithId,
  type UseFieldArrayAppend,
  type UseFieldArrayRemove,
  type UseFieldArraySwap,
} from "react-hook-form";

import { InfoIcon, PlusCircleIcon, Trash2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
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
import { Badge } from "~/components/ui/badge";
import { useDebounce } from "~/hooks/use-debounce";
import dynamic from "next/dynamic";

const SwapableContext = dynamic(
  () => import("../../swapable-context").then((m) => m.SwapableContext),
  { ssr: false },
);

const SwapableItemWithHandle = dynamic(
  () => import("../../swapable-context").then((m) => m.SwapableItemWithHandle),
  { ssr: false },
);

import type { ProductFormValues } from ".";
import { generateRandomId } from "~/lib/utils/generate-random-id";

export function Options({
  options,
  add,
  remove,
  swap,
}: {
  options: FieldArrayWithId<ProductFormValues, "options", "keyId">[];
  add: (id: number) => void;
  remove: (index: number) => void;
  swap: UseFieldArraySwap;
}) {
  const [openOptions, setOpenOptions] = useState<(string | number)[]>([]);

  function toggleOpen(id: number) {
    setOpenOptions((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  function handleRemove(id: number) {
    setOpenOptions((prev) => prev.filter((i) => i !== id));
    remove(options.findIndex((o) => o.id === id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = options.findIndex((o) => o.id === active.id);
      const newIndex = options.findIndex((o) => o.id === over?.id);

      if (oldIndex === -1 || newIndex === -1) return;

      swap(oldIndex, newIndex);
    }
  }

  function handleAddOption() {
    const newId = generateRandomId();
    setOpenOptions((prev) => [...prev, newId]);
    add(newId);
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
      <SwapableContext
        items={options.map((option) => option.id)}
        strategy={verticalListSortingStrategy}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        {options.map((option, index) => (
          <SwapableItemWithHandle
            key={option.id}
            id={option.id}
            disabled={openOptions.length > 0}
            className="bg-card items-start rounded-lg border pt-6 pr-2 pb-2 pl-4"
          >
            <Option
              key={option.id}
              id={option.id}
              index={index}
              option={option}
              open={openOptions.includes(option.id)}
              toggleOpen={() => toggleOpen(option.id)}
              remove={() => handleRemove(option.id)}
            />
          </SwapableItemWithHandle>
        ))}
      </SwapableContext>

      <Button type="button" variant="ghost" onClick={handleAddOption}>
        <PlusCircleIcon />
        Add Another Option
      </Button>
    </div>
  );
}

function Option({
  id,
  index,
  option,
  open,
  toggleOpen,
  remove,
}: {
  id: UniqueIdentifier;
  index: number;
  option: FieldArrayWithId<ProductFormValues, "options", "keyId">;
  open: boolean;
  toggleOpen: () => void;
  remove: () => void;
}) {
  const form = useFormContext<ProductFormValues>();

  async function handleDone() {
    const isValid = await form.trigger(`options.${index}`);

    if (isValid) {
      toggleOpen();
    }
  }

  function renderOptionContent() {
    if (!open) {
      return (
        <motion.button
          key={`option-closed-${id}`}
          type="button"
          onClick={toggleOpen}
          className="hover:bg-muted -mt-4 flex min-h-16 w-full flex-col items-start rounded-lg px-3 py-2 transition-colors"
          initial={{ opacity: 0, y: 16, height: 100 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -16, height: "auto" }}
          transition={{ duration: 0.1, ease: "easeOut" }}
        >
          <p className="font-medium">{option.name}</p>
          {option.values.length > 0 && (
            <div className="text-muted-foreground flex flex-wrap gap-1 text-sm">
              {option.values.map((v, index) => (
                <Badge key={`${v.value}-${index}`} variant="outline">
                  {v.value}
                </Badge>
              ))}
            </div>
          )}
        </motion.button>
      );
    }

    return (
      <motion.div
        key={`option-open-${id}`}
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
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {renderOptionContent()}
    </AnimatePresence>
  );
}

function OptionFields({ index }: { index: number }) {
  const [addValue, setAddValue] = useState("");
  const addValueInputRef = useRef<HTMLInputElement>(null);

  const form = useFormContext<ProductFormValues>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const debouncedAddValue = useDebounce(addValue, 500);

  useEffect(() => {
    if (debouncedAddValue.length > 0) {
      const valueId = generateRandomId();

      appendValue(
        { id: valueId, value: debouncedAddValue },
        { shouldFocus: true },
      );
      setAddValue("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedAddValue]);

  const {
    fields: valueFields,
    append: appendValue,
    remove: removeValue,
    swap: swapValues,
  } = useFieldArray({
    control: form.control,
    name: `options.${index}.values`,
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = valueFields.findIndex((v) => v.id === active.id);
      const newIndex = valueFields.findIndex((v) => v.id === over?.id);

      if (oldIndex === -1 || newIndex === -1) return;

      swapValues(oldIndex, newIndex);
    }
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
          {mounted ? (
            <SwapableContext
              items={valueFields.map((value) => value.id)}
              strategy={verticalListSortingStrategy}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              {valueFields.map((value, valueIndex) => (
                <SwapableItemWithHandle key={value.id} id={value.id}>
                  <OptionValueField
                    index={index}
                    valueIndex={valueIndex}
                    valueFields={valueFields}
                    appendValue={appendValue}
                    removeValue={removeValue}
                  />
                </SwapableItemWithHandle>
              ))}

              <div className="ml-6">
                <Input
                  placeholder="Add Another Value"
                  ref={addValueInputRef}
                  value={addValue}
                  className="w-full"
                  onChange={(e) => setAddValue(e.target.value)}
                />
              </div>
            </SwapableContext>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function OptionValueField({
  index,
  valueIndex,
  valueFields,
  removeValue,
  className,
}: {
  index: number;
  valueIndex: number;
  valueFields: FieldArrayWithId<ProductFormValues, "options", "id">["values"];
  appendValue: UseFieldArrayAppend<ProductFormValues>;
  removeValue: UseFieldArrayRemove;
  className?: string;
}) {
  const form = useFormContext<ProductFormValues>();

  return (
    <FormField
      control={form.control}
      name={`options.${index}.values.${valueIndex}.value`}
      render={({ field }) => (
        <FormItem className={cn("relative", className)}>
          <FormControl>
            <Input
              placeholder={
                valueIndex === 0 ? "Some Value" : "Add Another Value"
              }
              value={field.value}
              onChange={field.onChange}
            />
          </FormControl>

          {valueFields.length > 1 && (
            <button
              type="button"
              className="text-muted-foreground hover:text-destructive absolute top-1/2 right-2 size-6 -translate-y-1/2 cursor-pointer transition-colors"
              onClick={() => removeValue(valueIndex)}
            >
              <Trash2Icon className="size-4" />
            </button>
          )}
        </FormItem>
      )}
    />
  );
}
