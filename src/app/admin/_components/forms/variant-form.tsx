"use client";

import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type z from "zod";
import { useLayoutEffect, useState } from "react";
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
import { updateProductVariantInputSchema } from "~/lib/schemas/entities/product-variants";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input, NumberInput } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { MediaStoreProvider } from "../../_stores/media/provider";
import { InventoryTableInput } from "../inputs/inventory-table-input";
import { MediaDialog } from "../dialogs/media";
import { ImageWithFallback } from "~/components/image-with-fallback";

const variantFormSchema = updateProductVariantInputSchema;
export type VariantFormValues = z.infer<typeof variantFormSchema>;

export function VariantForm({
  onSubmit,
  className,
  defaultValues,
  isSubmitting = false,
}: {
  onSubmit: (data: VariantFormValues) => void;
  className?: string;
  isSubmitting?: boolean;
  defaultValues?: Partial<VariantFormValues>;
}) {
  const [itemRef, setItemRef] = useState<HTMLDivElement | null>(null);

  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantFormSchema),
    defaultValues: defaultValues ?? {
      id: 0,
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

  useLayoutEffect(() => {
    if (!itemRef) return;

    const timeout = setTimeout(() => {
      itemRef.style.visibility = "visible";
    }, 1000);

    return () => clearTimeout(timeout);
  }, [itemRef]);

  const { fields: optionFields } = useFieldArray({
    name: "options",
    control: form.control,
  });

  return (
    <>
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn("space-y-4", className)}
        >
          <Card>
            <CardHeader>
              <CardTitle>Variant Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Controller
                name="overridePrice"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Override Price</FieldLabel>

                    <NumberInput
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Override Price"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="thumbnail"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Thumbnail</FieldLabel>
                    <div>
                      <MediaStoreProvider
                        maxFiles={1}
                        defaultMedia={field.value ? [field.value] : undefined}
                      >
                        <MediaDialog
                          onChange={(media) => field.onChange(media[0] ?? null)}
                        >
                          <button
                            type="button"
                            className={cn(
                              "group cursor-pointer space-y-1 overflow-hidden rounded-md transition-opacity hover:opacity-80",
                              fieldState.invalid && "border-destructive",
                            )}
                            data-invalid={fieldState.invalid}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ImageWithFallback
                              src={field.value?.url}
                              alt="Thumbnail"
                              className="size-24 object-cover"
                              width={256}
                              height={256}
                            />
                            <p className="dark:text-primary-foreground text-sm font-medium hover:underline">
                              Change
                            </p>
                          </button>
                        </MediaDialog>
                      </MediaStoreProvider>
                    </div>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {optionFields.map((option, index) => {
                const key = Object.keys(option)[0]!;

                return (
                  <Controller
                    key={option.id}
                    name={`options.${index}.${key}.value`}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel className="capitalize">{key}</FieldLabel>
                        <Input
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                          placeholder="Option Value"
                          {...field}
                        />

                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Controller
                name="inventory"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <InventoryTableInput
                      data={field.value ? [field.value] : []}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </CardContent>
          </Card>
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
