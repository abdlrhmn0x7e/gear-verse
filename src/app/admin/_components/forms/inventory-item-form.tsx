"use client";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateManyInventoryItemsInputSchema } from "~/lib/schemas/entities/inventory-item";
import type z from "zod";
import { InventoryTable } from "../tables/inventory/table";
import type { RouterOutput } from "~/trpc/client";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "~/components/ui/item";
import { Button } from "~/components/ui/button";
import { SaveIcon, XIcon } from "lucide-react";
import { Spinner } from "~/components/spinner";

const inventoryItemFormSchema = updateManyInventoryItemsInputSchema;
export type InventoryItemFormValues = z.infer<typeof inventoryItemFormSchema>;

export function InventoryItemForm({
  onSubmit,
  values,
  isSubmitting = false,
}: {
  values: RouterOutput["admin"]["inventoryItems"]["queries"]["getPage"]["data"];
  onSubmit: (data: InventoryItemFormValues) => void;
  isSubmitting?: boolean;
}) {
  const [itemRef, setItemRef] = useState<HTMLDivElement | null>(null);

  const form = useForm<InventoryItemFormValues>({
    resolver: zodResolver(inventoryItemFormSchema),
    defaultValues: {
      inventory: values.map((item) => ({
        id: item.id,
        quantity: Number(item.quantity),
      })),
    },
  });

  function handleDiscard() {
    form.reset();
  }

  function handleSave() {
    void form.handleSubmit((data) => {
      onSubmit(data);
      form.reset(data);
    })();
  }

  useEffect(() => {
    form.setValue(
      "inventory",
      values.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      })),
    );
  }, [values, form]);

  useLayoutEffect(() => {
    if (!itemRef) return;

    const timeout = setTimeout(() => {
      itemRef.style.visibility = "visible";
    }, 1000);

    return () => clearTimeout(timeout);
  }, [itemRef]);

  return (
    <>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <InventoryTable />
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
            disabled={isSubmitting}
          >
            <XIcon />
            Discard
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={
              isSubmitting ||
              form.formState.isSubmitting ||
              !form.formState.isDirty
            }
          >
            {isSubmitting ? <Spinner /> : <SaveIcon />}
            Save
          </Button>
        </ItemActions>
      </Item>
    </>
  );
}
