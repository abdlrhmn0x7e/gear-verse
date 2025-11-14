import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import type z from "zod";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { createAttributeValueInputSchema } from "~/lib/schemas/entities/attribute-value";

const attributeFormSchema = createAttributeValueInputSchema.omit({
  attributeId: true,
});
export type AttributeValueFormValues = z.infer<typeof attributeFormSchema>;

export function AttributeValueForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: Partial<AttributeValueFormValues>;
  onSubmit: (values: AttributeValueFormValues) => void;
}) {
  const form = useForm<AttributeValueFormValues>({
    resolver: zodResolver(attributeFormSchema),
    defaultValues: defaultValues ?? {
      value: "",
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    void form.handleSubmit(onSubmit)(e);
  }

  return (
    <form id="attribute-value-form" onSubmit={handleSubmit}>
      <Controller
        control={form.control}
        name="value"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Name</FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="Red"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </form>
  );
}
