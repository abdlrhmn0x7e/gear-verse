"use client";

import {
  type Control,
  FormProvider,
  useForm,
  useFormState,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateManyInventoryItemsInputSchema } from "~/lib/schemas/entities/inventory-item";
import type z from "zod";
import type { RouterOutput } from "~/trpc/client";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "~/components/ui/item";
import { Button } from "~/components/ui/button";
import { CheckIcon, Undo2Icon } from "lucide-react";
import { Spinner } from "~/components/spinner";

const inventoryItemFormSchema = updateManyInventoryItemsInputSchema;
export type InventoryItemFormValues = z.infer<typeof inventoryItemFormSchema>;

type InventoryRows =
  RouterOutput["admin"]["inventoryItems"]["queries"]["getPage"]["data"];

function toFormValues(rows: InventoryRows): InventoryItemFormValues {
  return {
    inventory: rows.map((row) => ({
      id: row.id,
      quantity: Number(row.quantity),
    })),
  };
}

/**
 * Stock edits for the loaded inventory rows. Its rows follow `values` in order,
 * so the grid inside (`children`) can address a row by its index. Saving sends
 * only the rows that changed, so stock moved by an order in the meantime is
 * left alone everywhere else.
 */
export function InventoryItemForm({
  onSubmit,
  values,
  isSubmitting = false,
  children,
}: {
  values: InventoryRows;
  /** Gets the changed rows; resolve once they are saved. */
  onSubmit: (data: InventoryItemFormValues) => Promise<unknown>;
  isSubmitting?: boolean;
  children: ReactNode;
}) {
  const [itemRef, setItemRef] = useState<HTMLDivElement | null>(null);

  const form = useForm<InventoryItemFormValues>({
    resolver: zodResolver(inventoryItemFormSchema),
    defaultValues: toFormValues(values),
  });

  // The quantities the rows were loaded with, by item id: what an edit is
  // measured against.
  const savedRef = useRef(new Map<number, number>());

  // A search, the next page or a refetch changes the loaded rows. The form
  // starts over from them, carrying over edits to rows that are still here.
  // Before paint, so a row never shows another row's value.
  useLayoutEffect(() => {
    const saved = savedRef.current;
    const edits = new Map<number, number | undefined>();

    for (const row of form.getValues("inventory") ?? []) {
      if (saved.has(row.id) && row.quantity !== saved.get(row.id)) {
        edits.set(row.id, row.quantity);
      }
    }

    const next = toFormValues(values);
    savedRef.current = new Map(
      next.inventory.map((row) => [row.id, row.quantity]),
    );
    form.reset(next);

    next.inventory.forEach((row, index) => {
      if (edits.has(row.id)) {
        form.setValue(`inventory.${index}.quantity`, edits.get(row.id)!, {
          shouldDirty: true,
        });
      }
    });
  }, [values, form]);

  function handleDiscard() {
    form.reset();
  }

  function handleSave() {
    void form.handleSubmit(async (data) => {
      const saved = savedRef.current;
      const changed = data.inventory.filter(
        (row) => row.quantity !== saved.get(row.id),
      );

      if (changed.length === 0) {
        form.reset(data);
        return;
      }

      try {
        await onSubmit({ inventory: changed });
      } catch {
        // Not saved: the edits stay for another try.
        return;
      }
      // Saved: what is on screen is the new baseline until the refetch lands.
      for (const row of changed) saved.set(row.id, row.quantity);
      form.reset(data);
    })();
  }

  useLayoutEffect(() => {
    if (!itemRef) return;

    const timeout = setTimeout(() => {
      itemRef.style.visibility = "visible";
    }, 1000);

    return () => clearTimeout(timeout);
  }, [itemRef]);

  return (
    <FormProvider {...form}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSave();
        }}
      >
        {children}
      </form>

      <Item
        variant="outline"
        style={{ visibility: "hidden" }}
        className="surface-floating bg-popover text-popover-foreground data-[state=visible]:animate-item-in data-[state=hidden]:animate-item-out starting-opacity-0-fix fixed inset-x-2 bottom-4 z-20 w-auto shadow-lg md:inset-x-auto md:right-12 md:bottom-12 md:max-w-lg"
        data-state={form.formState.isDirty ? "visible" : "hidden"}
        ref={setItemRef}
      >
        <ItemContent>
          <ItemTitle>Unsaved Changes</ItemTitle>
          <ChangedCount control={form.control} />
        </ItemContent>

        <ItemActions>
          <Button
            type="button"
            variant="destructive-outline"
            size="sm"
            onClick={handleDiscard}
            disabled={isSubmitting}
          >
            <Undo2Icon data-icon="inline-start" />
            Discard
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={
              isSubmitting ||
              form.formState.isSubmitting ||
              !form.formState.isDirty
            }
          >
            {isSubmitting ? (
              <Spinner size="small" data-icon="inline-start" />
            ) : (
              <CheckIcon data-icon="inline-start" />
            )}
            Save
          </Button>
        </ItemActions>
      </Item>
    </FormProvider>
  );
}

function ChangedCount({
  control,
}: {
  control: Control<InventoryItemFormValues>;
}) {
  const { defaultValues } = useFormState({ control });
  const rows = useWatch({ control, name: "inventory" });
  const count = rows.filter(
    (row, index) =>
      row.quantity !== defaultValues?.inventory?.[index]?.quantity,
  ).length;

  return (
    <ItemDescription>
      {count === 1
        ? "1 item has unsaved stock changes."
        : `${count} items have unsaved stock changes.`}{" "}
      Save or discard them.
    </ItemDescription>
  );
}
