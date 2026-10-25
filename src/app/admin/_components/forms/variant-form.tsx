"use client";

import {
  type Control,
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormState,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type z from "zod";
import { SaveBar } from "../save-bar";
import { updateProductVariantInputSchema } from "~/lib/schemas/entities/product-variants";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input, NumberInput } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { MediaStoreProvider } from "../../_stores/media/provider";
import { MediaDialog } from "../dialogs/media";
import { ImageWithFallback } from "~/components/image-with-fallback";

const FORM_ID = "variant-form";
const variantFormSchema = updateProductVariantInputSchema;
export type VariantFormValues = z.infer<typeof variantFormSchema>;

export function VariantForm({
  onSubmit,
  className,
  defaultValues,
  isSubmitting = false,
}: {
  /** The form counts as saved once this resolves; a rejection keeps the edits. */
  onSubmit: (data: VariantFormValues) => void | Promise<unknown>;
  className?: string;
  isSubmitting?: boolean;
  defaultValues?: Partial<VariantFormValues>;
}) {
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
    void form.handleSubmit(async (data) => {
      try {
        await onSubmit(data);
        form.reset(data);
      } catch {
        // the caller reports the failure; the unsaved changes stay up
      }
    })();
  }

  const { fields: optionFields } = useFieldArray({
    name: "options",
    control: form.control,
  });

  return (
    <>
      <FormProvider {...form}>
        <form
          id={FORM_ID}
          onSubmit={(event) => {
            event.preventDefault();
            // Enter in a field submits too; one save at a time.
            if (isSubmitting || form.formState.isSubmitting) return;
            handleSave();
          }}
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
                    <FieldLabel htmlFor={field.name}>Override Price</FieldLabel>

                    <NumberInput
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Override Price"
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
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
                          onChange={(media) => field.onChange(media[0])}
                        >
                          <button
                            type="button"
                            className={cn(
                              "group cursor-pointer space-y-1 overflow-hidden rounded-md transition-opacity hover:opacity-80",
                              fieldState.invalid && "border-destructive",
                            )}
                            data-invalid={fieldState.invalid}
                            aria-label="Change thumbnail"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ImageWithFallback
                              src={field.value?.url}
                              alt="Thumbnail"
                              className="size-24 object-cover"
                              width={256}
                              height={256}
                            />
                            <p className="text-sm font-medium hover:underline">
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
                        <FieldLabel htmlFor={field.name} className="capitalize">
                          {key}
                        </FieldLabel>
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
                name="inventory.quantity"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Stock</FieldLabel>
                    <NumberInput
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="0"
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </CardContent>
          </Card>

          <VariantSaveBar
            control={form.control}
            saving={isSubmitting}
            onDiscard={handleDiscard}
          />
        </form>
      </FormProvider>
    </>
  );
}

function VariantSaveBar({
  control,
  saving,
  onDiscard,
}: {
  control: Control<VariantFormValues>;
  saving: boolean;
  onDiscard: () => void;
}) {
  const { isDirty, isSubmitting } = useFormState({ control });

  return (
    <SaveBar
      form={FORM_ID}
      visible={isDirty || saving || isSubmitting}
      saving={saving || isSubmitting}
      saveLabel="Save variant"
      onDiscard={onDiscard}
    />
  );
}
