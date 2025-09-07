"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { imageSchema } from "~/lib/schemas/image";
import { productSchema } from "~/lib/schemas/product";
import { Editor } from "../editor";
import { CategoryCombobox } from "../inputs/category-combobox";
import { FileDropzone } from "../inputs/file-dropzone";
import { BrandsCombobox } from "../inputs/brands-combobox";
import { useMemo } from "react";
import type { MediaOwnerType } from "~/lib/schemas/media";

const productFormSchema = productSchema
  .omit({ id: true, createdAt: true, updatedAt: true, thumbnailMediaId: true })
  .and(
    z.object({
      images: z
        .array(imageSchema, "Images are required")
        .min(1, "Images are required")
        .optional(),
    }),
  );
export type ProductFormValues = z.infer<typeof productFormSchema>;

export function ProductForm({
  onSubmit,
  defaultValues,
  oldImages,
}: {
  onSubmit: (data: ProductFormValues) => void;
  defaultValues?: Partial<ProductFormValues>;
  oldImages?: { id: number; url: string; ownerType: MediaOwnerType }[];
}) {
  const schema = useMemo(() => {
    return productFormSchema.superRefine((data, ctx) => {
      if (defaultValues) {
        return;
      }
      if (data.images?.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Images are required",
        });
      }
    });
  }, [defaultValues]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      title: "",
      description: {},
      categoryId: 0,
      brandId: 0,
      images: [],
    },
  });

  return (
    <Form {...form}>
      <form
        id="product-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <CategoryCombobox
                    value={field.value}
                    setValue={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="brandId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <BrandsCombobox
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Images</FormLabel>
              <FormControl>
                <FileDropzone
                  onChange={field.onChange}
                  initialFiles={oldImages}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Editor
                  onUpdate={field.onChange}
                  defaultContent={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
