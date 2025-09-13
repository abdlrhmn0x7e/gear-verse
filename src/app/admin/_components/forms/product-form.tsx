"use client";

import { useFieldArray, useForm, type Control } from "react-hook-form";
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
import { Editor } from "../editor";
import { CategoryCombobox } from "../inputs/category-combobox";
import { FileDropzone } from "../inputs/file-dropzone";
import { BrandsCombobox } from "../inputs/brands-combobox";
import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import {
  PackageOpenIcon,
  PlusIcon,
  SettingsIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";
import { Collapsable } from "~/components/collapsable";
import type { MediaAsset } from "~/lib/schemas/media";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { productSchema } from "~/lib/schemas/product";
import { productVariantSchema } from "~/lib/schemas/product-variants";

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

  function handleSpecsPaste(
    event: React.ClipboardEvent<HTMLInputElement>,
    index: number,
  ) {
    const text = event.clipboardData.getData("text");
    const lines = text.trim().split(/\r?\n/);
    if (lines.length === 0) {
      return;
    }

    event.preventDefault(); // Prevent default paste behavior

    const specs: { name: string; value: string }[] = [];
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        continue;
      }

      let name = "";
      let value = "";

      // Prefer colon-delimited if present (e.g., "Key: Value")
      const colonIndex = line.indexOf(":");
      if (colonIndex !== -1) {
        name = line.slice(0, colonIndex).trim();
        value = line.slice(colonIndex + 1).trim();
      } else {
        // Otherwise split on two-or-more spaces or tabs between columns
        const separatorRegex = /^(.*?)(?:\s{2,}|\t+)(.+)$/;
        const execResult = separatorRegex.exec(line);
        if (execResult) {
          const rawName = execResult[1] ?? "";
          const rawValue = execResult[2] ?? "";
          name = rawName.trim();
          value = rawValue.trim();
        } else {
          continue;
        }
      }

      // Strip trailing "— confirm" / "- confirm" notes
      value = value.replace(/\s*[—–-]\s*confirm\b.*$/i, "").trim();
      if (!name || !value) {
        continue;
      }

      specs.push({ name, value });
    }

    if (specs.length === 0) {
      return;
    }

    const currentSpec = specs[0];
    const restSpecs = specs.slice(1);
    if (!currentSpec) {
      return;
    }
    form.setValue(`specifications.${index}`, currentSpec);
    if (restSpecs.length > 0) {
      appendSpecification(restSpecs);
    }
  }

  return (
    <Form {...form}>
      <form
        id="product-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Hopefully a hit" autoFocus {...field} />
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
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Summary</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A short summary of the product. this is shown on the product card."
                  className="h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`thumbnail`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thumbnail</FormLabel>
              <FormControl>
                <FileDropzone
                  onChange={field.onChange}
                  maxFiles={1}
                  initialFiles={
                    oldThumbnailAsset ? [oldThumbnailAsset] : undefined
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="variants"
          render={() => (
            <FormItem>
              <FormLabel className="text-xl font-medium">Variants</FormLabel>
              {variants.length === 0 ? (
                <div
                  role="button"
                  onClick={handleVariantAppend}
                  className={cn(
                    "hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 py-6",
                    form.formState.errors.variants &&
                      "border-destructive text-destructive",
                  )}
                >
                  <PackageOpenIcon className="size-8" />
                  <p>No variants added</p>
                  <Button
                    variant="outline"
                    type="button"
                    className="pointer-events-none w-full max-w-sm"
                  >
                    <PlusIcon className="size-4" />
                    Add Variant
                  </Button>
                </div>
              ) : (
                <>
                  {variants.map((variant, index) => (
                    <FormControl key={variant.fieldId}>
                      <ProductVariantField
                        control={form.control}
                        variantIndex={index}
                        remove={() => removeVariant(index)}
                        oldVariantAssets={
                          variant.id
                            ? (oldVariantsAssets?.[`variant-${variant.id}`] ??
                              {})
                            : {}
                        }
                      />
                    </FormControl>
                  ))}
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full"
                    onClick={handleVariantAppend}
                  >
                    <PlusIcon className="size-4" />
                    Add Variant
                  </Button>
                </>
              )}

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specifications"
          render={() => (
            <FormItem>
              <FormLabel className="text-xl font-medium">
                Specifications
              </FormLabel>
              <FormControl>
                <div
                  className={cn(
                    "overflow-hidden rounded-lg border",
                    form.formState.errors.specifications &&
                      "border-destructive text-destructive",
                  )}
                >
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow className="sticky top-0 pb-1">
                        <TableHead>Name</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {specifications.map((field, index) => (
                        <TableRow
                          key={field.id}
                          className="hover:bg-transparent"
                        >
                          <TableCell className="ring-primary transition-all has-focus-within:inset-ring-2">
                            <FormField
                              control={form.control}
                              name={`specifications.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      onPaste={(e) =>
                                        handleSpecsPaste(e, index)
                                      }
                                      className="border-none shadow-none focus-visible:ring-0 dark:bg-transparent"
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="ring-primary transition-all has-focus-within:inset-ring-2">
                            <FormField
                              control={form.control}
                              name={`specifications.${index}.value`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      className="border-none shadow-none focus-visible:ring-0 dark:bg-transparent"
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="w-12">
                            <Button
                              variant="destructiveGhost"
                              size="icon"
                              onClick={() => removeSpecification(index)}
                            >
                              <TrashIcon className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}

                      {specifications.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center">
                            <div className="flex flex-col items-center justify-center gap-2 py-6">
                              <SettingsIcon className="size-8" />
                              <p className="text-sm">No specifications added</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full rounded-t-none border-r-0 border-b-0 border-l-0"
                    onClick={() => appendSpecification({ name: "", value: "" })}
                  >
                    <PlusIcon className="size-4" />
                    Add Specification
                  </Button>
                </div>
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
              <FormLabel className="text-xl font-medium">Description</FormLabel>
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

function ProductVariantField({
  control,
  variantIndex,
  remove,
  oldVariantAssets,
}: {
  control: Control<ProductFormInput>;
  variantIndex: number;
  remove: () => void;
  oldVariantAssets: Partial<{
    thumbnail: MediaAsset;
    images: MediaAsset[];
  }>;
}) {
  const {
    fields: options,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control,
    name: `variants.${variantIndex}.options`,
  });

  return (
    <Collapsable
      defaultOpen={variantIndex === 0}
      title={
        <div className="flex flex-1 items-center justify-between gap-2 pr-4">
          <FormField
            control={control}
            name={`variants.${variantIndex}.name`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Variant Name"
                    className="w-sm"
                    onClick={(e) => e.stopPropagation()}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button variant="destructiveGhost" size="icon" onClick={remove}>
            <TrashIcon className="size-4" />
          </Button>
        </div>
      }
      className="space-y-4"
    >
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
        <FormField
          control={control}
          name={`variants.${variantIndex}.price`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  placeholder="0.00$ for the bois?"
                  type="number"
                  min={0}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`variants.${variantIndex}.stock`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock</FormLabel>
              <FormControl>
                <Input
                  placeholder="How many in stock?"
                  type="number"
                  min={0}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`variants.${variantIndex}.thumbnail`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thumbnail</FormLabel>
              <FormControl>
                <FileDropzone
                  onChange={field.onChange}
                  maxFiles={1}
                  initialFiles={
                    oldVariantAssets?.thumbnail
                      ? [oldVariantAssets.thumbnail]
                      : undefined
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`variants.${variantIndex}.images`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Images</FormLabel>
              <FormControl>
                <FileDropzone
                  onChange={field.onChange}
                  initialFiles={oldVariantAssets?.images ?? undefined}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name={`variants.${variantIndex}.options`}
        render={() => (
          <FormItem>
            <div className="mb-2 flex items-center justify-between">
              <FormLabel>Options</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendOption({ value: "" })}
              >
                <PlusIcon className="size-4" />
                Add Option
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {options.length === 0 ? (
                <div className="flex w-full flex-col items-center justify-center gap-2 py-6">
                  <SettingsIcon className="size-8" />
                  <p className="text-muted-foreground text-sm">
                    No options added
                  </p>
                </div>
              ) : (
                options.map((option, index) => (
                  <FormField
                    key={option.id}
                    control={control}
                    name={`variants.${variantIndex}.options.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="w-fit">
                        <Badge
                          variant="outline"
                          className="ring-primary h-9 gap-0 has-focus-within:ring-2"
                        >
                          <FormControl>
                            <Input
                              placeholder="Cool ahh option"
                              className="border-none shadow-none focus-visible:ring-0 dark:bg-transparent"
                              style={{
                                width: `${Math.max((field.value?.length || 0) + 2, 18)}ch`,
                              }}
                              {...field}
                            />
                          </FormControl>

                          <button
                            type="button"
                            className="hover:text-destructive/50 cursor-pointer transition-colors"
                            onClick={() => removeOption(index)}
                          >
                            <XIcon className="size-4" />
                          </button>
                        </Badge>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </Collapsable>
  );
}
