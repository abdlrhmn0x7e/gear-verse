"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { categoryEntitySchema } from "~/lib/schemas/entities/category";
import { CategoriesCombobox } from "../inputs/categories-combobox";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectValue,
  SelectTrigger,
  SelectGroup,
} from "~/components/ui/select";
import { iconsMap } from "~/lib/icons-map";

const categoryFormSchema = categoryEntitySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  slug: true,
});

/* the trigger shows the chosen icon (its name is hidden there), so the select gets them as its items */
const iconItems = Array.from(iconsMap.entries()).map(([key, Icon]) => ({
  value: key,
  label: (
    <div className="flex items-center gap-2">
      <Icon />
      <span className="truncate">{key.toLowerCase()}</span>
    </div>
  ),
}));

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export function CategoryForm({
  defaultValues,
  showParentCombobox = true,
  formId = "category-form",
  onSubmit,
}: {
  defaultValues: Partial<CategoryFormValues>;
  showParentCombobox?: boolean;
  /** For the submit button's `form`; give each form open at once its own. */
  formId?: string;
  onSubmit: (data: CategoryFormValues) => void;
}) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: defaultValues.name ?? "",
      icon: defaultValues.icon ?? "CABLES",
      parent_id: defaultValues.parent_id ?? null,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          void form.handleSubmit(onSubmit)(e);
        }}
        className="space-y-4"
        id={formId}
      >
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <Select
                  items={iconItems}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      aria-label="Category icon"
                      className="w-16 gap-1 px-3 [&>span>div>span]:hidden"
                    >
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    <SelectGroup>
                      {iconItems.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>
                          {icon.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input placeholder="Category Name" {...field} autoFocus />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {showParentCombobox && (
          <FormField
            control={form.control}
            name="parent_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Category (optional)</FormLabel>
                <FormControl>
                  <CategoriesCombobox
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </form>
    </Form>
  );
}
