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
import { Textarea } from "~/components/ui/textarea";

const listingFormSchema = listingSchema
  .omit({
    id: true,
    thumbnailMediaId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    thumbnail: imageSchema.optional(),
    products: z.array(z.number()),
  });
export type ListingFormValues = z.output<typeof listingFormSchema>;
type ListingFormInputValues = z.input<typeof listingFormSchema>;

export function ListingForm({
  onSubmit,
  defaultValues,
  oldThumbnail,
  className,
}: {
  onSubmit: (data: ListingFormValues) => void;
  defaultValues?: Partial<ListingFormInputValues>;
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

  const form = useForm<ListingFormInputValues, unknown, ListingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues ?? {
      title: "",
      description: "",
      products: [],
      price: "",
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} className="min-h-32 resize-none" />
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
                <Input {...field} />
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
                <Input
                  min={0}
                  type="number"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={
                    typeof field.value === "number" ||
                    typeof field.value === "string"
                      ? field.value
                      : ""
                  }
                  onChange={(e) => field.onChange(e.target.value)}
                />
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
                  onChange={(files) => field.onChange(files[0])}
                  initialFiles={
                    oldThumbnail
                      ? [
                          {
                            id: oldThumbnail.id,
                            url: oldThumbnail.url,
                            ownerType: "LISTING",
                          },
                        ]
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
