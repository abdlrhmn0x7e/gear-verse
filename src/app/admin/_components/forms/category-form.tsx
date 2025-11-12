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
export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export function CategoryForm({
  defaultValues,
  showParentCombobox = true,
  onSubmit,
}: {
  defaultValues: Partial<CategoryFormValues>;
  showParentCombobox?: boolean;
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
        id="category-form"
      >
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-17">
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    <SelectGroup>
                      {Array.from(iconsMap.entries()).map(([key, Icon]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <Icon />
                            <span className="capitalize">
                              {key.toLowerCase()}
                            </span>
                          </div>
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
