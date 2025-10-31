import { createUserInputSchema } from "~/lib/schemas/entities/users";
import type z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";

const customerFormSchema = createUserInputSchema;
export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export function CustomerForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: Partial<CustomerFormValues>;
  onSubmit: (values: CustomerFormValues) => void;
}) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: defaultValues ?? {
      name: "",
      email: `temp-user-${Date.now()}@gearverse.com`,
      role: "user",
      isAnonymous: false,
    },
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    void form.handleSubmit(onSubmit)(e);
  }

  return (
    <form id="customer-form" onSubmit={handleSubmit}>
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Name</FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="Amr Khaled"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </form>
  );
}
