"use client";

import { useFieldArray, useForm } from "react-hook-form";
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
import { imageSchema } from "~/lib/schemas/image";
import { useMemo } from "react";
import type { MediaAsset } from "~/lib/schemas/media";
import { productSchema } from "~/lib/schemas/product";
import { productVariantSchema } from "~/lib/schemas/product-variants";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Editor } from "../editor";
import { FileDropzone } from "../inputs/file-dropzone";

const productFormSchema = productSchema
  .omit({
    id: true,
    slug: true,
    published: true,
    specifications: true,
    thumbnailMediaId: true,
    createdAt: true,
    updatedAt: true,
  })
  .and(
    z.object({
      thumbnail: z.array(imageSchema).optional(),

      specifications: z
        .array(
          z.object({
            name: z.string("Name must be text").min(1, "Name is required"),
            value: z.string("Value must be text").min(1, "Value is required"),
          }),
        )
        .min(1, "Specifications are required"),

      variants: z
        .array(
          productVariantSchema
            .omit({
              id: true,
              options: true,
              thumbnailMediaId: true,
              productId: true,
              createdAt: true,
              updatedAt: true,
            })
            .extend({
              id: z
                .number("ID must be a number")
                .nonnegative("ID must be positive")
                .optional(),
              options: z.array(
                z.object({
                  value: z
                    .string("Option value is required")
                    .min(1, "Option value is required"),
                }),
              ),
              thumbnail: z.array(imageSchema).optional(),
              images: z.array(imageSchema).optional(),
            }),
          "Variants are required",
        )
        .min(1, "Variants are required"),
    }),
  );
export type ProductFormValues = z.infer<typeof productFormSchema>;
export type ProductFormInput = z.input<typeof productFormSchema>;

export function ProductForm({
  onSubmit,
  defaultValues,
  oldThumbnailAsset,
  oldVariantsAssets,
}: {
  onSubmit: (data: ProductFormValues) => void;
  defaultValues?: Partial<ProductFormValues>;
  oldThumbnailAsset?: MediaAsset;
  oldVariantsAssets?: Record<
    string,
    Partial<{
      thumbnail: MediaAsset;
      images: MediaAsset[];
    }>
  >;
}) {
  const schema = useMemo(() => {
    return productFormSchema.superRefine((data, ctx) => {
      if (defaultValues) {
        return;
      }

      if (!data.thumbnail) {
        ctx.addIssue({
          code: "custom",
          path: ["thumbnail"],
          message: "Thumbnail is required",
        });
      }

      data.variants.forEach((variant, index) => {
        if (!variant.thumbnail) {
          ctx.addIssue({
            code: "custom",
            path: ["variants", index, "thumbnail"],
            message: "Thumbnail is required",
          });
        }

        if (!variant.images) {
          ctx.addIssue({
            code: "custom",
            path: ["variants", index, "images"],
            message: "Images are required",
          });
        }
      });
    });
  }, [defaultValues]);

  const form = useForm<ProductFormInput, undefined, ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      name: "",
      summary: "",
      description: {},
      categoryId: 0,
      brandId: 0,
      specifications: [],
      variants: [],
    },
  });
  const {
    fields: specifications,
    append: appendSpecification,
    remove: removeSpecification,
  } = useFieldArray({
    control: form.control,
    name: "specifications",
  });
  const {
    fields: variants,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control: form.control,
    name: "variants",
    keyName: "fieldId",
  });

  function handleVariantAppend() {
    appendVariant({
      name: "",
      stock: 0,
      price: 0,
      options: [],
      thumbnail: [],
      images: [],
    });
  }

  return (
    <Form {...form}>
      <form
        id="product-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-3 gap-12"
      >
        <div className="col-span-2 space-y-8">
          <Card>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-2">
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

              <FormField
                control={form.control}
                name="media"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Media</FormLabel>
                    <FormControl>
                      <FileDropzone onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
        <div></div>
      </form>
    </Form>
  );
}
