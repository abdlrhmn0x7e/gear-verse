"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInventoryItemInputSchema } from "~/lib/schemas/entities/inventory-item";
import type z from "zod";
import { InventoryTable } from "../tables/inventory/table";
import type { RouterOutputs } from "~/trpc/react";
import { useEffect, useMemo, useState } from "react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "~/components/ui/item";
import { Button } from "~/components/ui/button";
import { SaveIcon, XIcon } from "lucide-react";

const inventoryItemFormSchema = createInventoryItemInputSchema;
export type InventoryItemFormValues = z.infer<typeof inventoryItemFormSchema>;

export function InventoryItemForm({
  onSubmit,
  values,
}: {
  values: RouterOutputs["admin"]["inventoryItems"]["queries"]["getPage"]["data"];
  onSubmit: (data: InventoryItemFormValues) => void;
}) {
  const [itemRef, setItemRef] = useState<HTMLDivElement | null>(null);
  const defaultValues = useMemo(() => {
    return {
      inventory: values.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      })),
    };
  }, [values]);

  const form = useForm<InventoryItemFormValues>({
    resolver: zodResolver(inventoryItemFormSchema),
    defaultValues: {
      inventory: defaultValues.inventory,
    },
  });

  function handleDiscard() {
    form.reset();
  }

  function handleSave() {
    void form.handleSubmit(onSubmit)();
  }

  useEffect(() => {
    if (!itemRef) return;

    const timeout = setTimeout(() => {
      itemRef.style.visibility = "visible";
    }, 200);

    return () => clearTimeout(timeout);
  }, [itemRef]);

  return (
    <>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <InventoryTable data={values} />
        </form>
      </FormProvider>

      <Item
        variant="outline"
        style={{ visibility: "hidden" }}
        className="data-[state=visible]:animate-item-in data-[state=hidden]:animate-item-out starting-opacity-0-fix fixed inset-x-2 bottom-4 md:inset-x-auto md:right-12 md:bottom-12"
        data-state={form.formState.isDirty ? "visible" : "hidden"}
        ref={setItemRef}
      >
        <ItemContent>
          <ItemTitle>Unsaved Changes</ItemTitle>
          <ItemDescription>
            You have unsaved changes. Please save or discard your changes.
          </ItemDescription>
        </ItemContent>

        <ItemActions>
          <Button
            variant="destructive-outline"
            size="sm"
            onClick={handleDiscard}
          >
            <XIcon />
            Discard
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave}>
            <SaveIcon />
            Save
          </Button>
        </ItemActions>
      </Item>
    </>
  );
}
