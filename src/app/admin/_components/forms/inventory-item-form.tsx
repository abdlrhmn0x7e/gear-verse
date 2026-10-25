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
import { type ReactNode, useLayoutEffect, useRef } from "react";
import { SaveBar } from "../save-bar";

const FORM_ID = "inventory-form";

const inventoryItemFormSchema = updateManyInventoryItemsInputSchema;
export type InventoryItemFormValues = z.infer<typeof inventoryItemFormSchema>;

type InventoryRows = { id: number; quantity: number }[];

function toFormValues(rows: InventoryRows): InventoryItemFormValues {
  return {
    inventory: rows.map((row) => ({
      id: row.id,
      quantity: Number(row.quantity),
    })),
  };
}

/**
 * Stock edits for the loaded inventory items. Its rows follow `values` in
 * order, so the grid inside (`children`) can address an item by its index in
 * `values`, however the grid nests them. Saving sends only the rows that
 * changed, so stock moved by an order in the meantime is left alone
 * everywhere else.
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

    // The new rows' cells register before this runs; an item with no cell on
    // screen (inside a collapsed group) leaves a hole in the array until then.
    for (const row of form.getValues("inventory") ?? []) {
      if (!row) continue;
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

  return (
    <FormProvider {...form}>
      <form
        id={FORM_ID}
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          // Enter in a quantity field submits too; one save at a time.
          if (isSubmitting || form.formState.isSubmitting) return;
          handleSave();
        }}
      >
        {children}

        <InventorySaveBar
          control={form.control}
          saving={isSubmitting}
          onDiscard={handleDiscard}
        />
      </form>
    </FormProvider>
  );
}

/** The shared save bar, counting the rows with unsaved stock. */
function InventorySaveBar({
  control,
  saving,
  onDiscard,
}: {
  control: Control<InventoryItemFormValues>;
  saving: boolean;
  onDiscard: () => void;
}) {
  const { defaultValues, isDirty, isSubmitting } = useFormState({ control });
  const rows = useWatch({ control, name: "inventory" });
  const count = rows.filter(
    (row, index) =>
      row.quantity !== defaultValues?.inventory?.[index]?.quantity,
  ).length;

  return (
    <SaveBar
      form={FORM_ID}
      visible={isDirty || saving || isSubmitting}
      saving={saving || isSubmitting}
      label={
        count === 1
          ? "1 unsaved stock change"
          : count > 1
            ? `${count} unsaved stock changes`
            : "Unsaved changes"
      }
      onDiscard={onDiscard}
      // floats over the list's last rows, clear of its stats bar, as the list scrolls itself
      className="absolute inset-x-0 bottom-12 px-4"
    />
  );
}
