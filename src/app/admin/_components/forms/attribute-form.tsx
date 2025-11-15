"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import type z from "zod";
import { createAttributeInputSchema } from "~/lib/schemas/entities/attribute";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  CheckCheckIcon,
  CheckIcon,
  SlidersHorizontalIcon,
  ToggleRightIcon,
} from "lucide-react";

const attributeFormSchema = createAttributeInputSchema;
export type AttributeFormValues = z.infer<typeof attributeFormSchema>;

const attributeTypes = [
  {
    name: "Select",
    value: "SELECT",
    icon: CheckIcon,
  },
  {
    name: "Multi Select",
    value: "MULTISELECT",
    icon: CheckCheckIcon,
  },
  {
    name: "Boolean",
    value: "BOOLEAN",
    icon: ToggleRightIcon,
  },
];

export function AttributeForm({
  onSubmit,
  defaultValues,
}: {
  onSubmit: (data: AttributeFormValues) => void;
  defaultValues?: Partial<AttributeFormValues>;
}) {
  const form = useForm<AttributeFormValues>({
    resolver: zodResolver(attributeFormSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      type: defaultValues?.type ?? "MULTISELECT",
    },
  });

  return (
    <form
      id="attribute-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="form-rhf-input-name">Name</FieldLabel>
            <Input
              {...field}
              id="form-rhf-input-name"
              aria-invalid={fieldState.invalid}
              placeholder="Color"
              autoComplete="off"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <FieldGroup>
        <Controller
          name="type"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="responsive" data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor="form-rhf-select-attribute-type">
                  Attribute Type
                </FieldLabel>
                <FieldDescription>
                  Select the type of attribute you want to create.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="form-rhf-select-attribute-type"
                  aria-invalid={fieldState.invalid}
                  className="min-w-[150px]"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="item-aligned">
                  {attributeTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon />
                        <span className="capitalize">{type.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  );
}
