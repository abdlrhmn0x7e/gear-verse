"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormField,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { imageSchema } from "~/lib/schemas/image";
import { listingSchema } from "~/lib/schemas/listing";
import { FileDropzone } from "../inputs/file-dropzone";
import { cn } from "~/lib/utils";
import { ProductsCombobox } from "../inputs/products-combobox";

const listingFormSchema = listingSchema
  .omit({
    id: true,
    thumbnailMediaId: true,
    createdAt: true,
    updatedAt: true,
  })
  .and(
    z.object({
      thumbnail: imageSchema.optional(),
      products: z.array(z.number()),
    }),
  );
export type ListingFormValues = z.infer<typeof listingFormSchema>;

export function ListingForm({
  onSubmit,
  defaultValues,
  oldThumbnail,
  className,
}: {
  onSubmit: (data: ListingFormValues) => void;
  defaultValues?: Partial<ListingFormValues>;
  oldThumbnail?: { id: number; url: string };
  className?: string;
}) {
  const formSchema = useMemo(() => {
    if (defaultValues) {
      return listingFormSchema;
    }

    return listingFormSchema.superRefine((data, ctx) => {
      if (!data.thumbnail) {
        ctx.addIssue({
          code: "custom",
          message: "Thumbnail is required",
        });
      }
    });
  }, [defaultValues]);

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues ?? {
      title: "",
      products: [],
      price: 0,
      stock: 0,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-4", className)}
        id="listing-form"
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
        <FormField
          control={form.control}
          name="products"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Products</FormLabel>
              <FormControl>
                <ProductsCombobox
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input min={0} type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock</FormLabel>
              <FormControl>
                <Input min={0} type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="thumbnail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thumbnail</FormLabel>
              <FormControl>
                <FileDropzone
                  maxFiles={1}
                  onChange={field.onChange}
                  initialFiles={
                    oldThumbnail
                      ? [{ id: oldThumbnail.id, url: oldThumbnail.url }]
                      : undefined
                  }
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
