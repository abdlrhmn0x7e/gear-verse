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
import { Input } from "~/components/ui/input";
import { imageSchema } from "~/lib/schemas/image";
import { productSchema } from "~/lib/schemas/product";
import { Editor } from "../editor";
import { CategoryCombobox } from "../inputs/category-combobox";
import { FileDropzone } from "../inputs/file-dropzone";
import { BrandsCombobox } from "../inputs/brands-combobox";
import { useMemo } from "react";
import type { MediaOwnerType } from "~/lib/schemas/media";
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
} from "lucide-react";
import { Collapsable } from "~/components/collapsable";

const productFormSchema = productSchema
  .omit({ id: true, specifications: true, createdAt: true, updatedAt: true })
  .and(
    z.object({
      specifications: z.array(
        z.object({
          name: z.string(),
          value: z.string(),
        }),
      ),

      variants: z.array(
        z.object({
          name: z.string(),
          thumbnail: z.array(imageSchema).optional(),
          images: z.array(imageSchema).optional(),
        }),
        "Variants are required",
      ),
    }),
  );
export type ProductFormValues = z.infer<typeof productFormSchema>;

export function ProductForm({
  onSubmit,
  defaultValues,
}: {
  onSubmit: (data: ProductFormValues) => void;
  defaultValues?: Partial<ProductFormValues>;
}) {
  const schema = useMemo(() => {
    return productFormSchema.superRefine((data, ctx) => {
      if (defaultValues) {
        return;
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

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? {
      title: "",
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
  });

  function handleSpecsPaste(
    event: React.ClipboardEvent<HTMLInputElement>,
    index: number,
  ) {
    const text = event.clipboardData.getData("text");
    const lines = text.split("\n");
    if (lines.length === 0) {
      return;
    }

    event.preventDefault(); // Prevent default paste behavior

    const specs: { name: string; value: string }[] = [];
    for (const line of lines) {
      const [name, value] = line.split(" ");
      if (!name || !value) {
        continue;
      }

      specs.push({ name: name.trim(), value: value.trim() });
    }

    if (specs.length === 0) {
      return;
    }

    const [currentSpecs, ...restSpecs] = specs;
    form.setValue(`specifications.${index}`, currentSpecs!);
    appendSpecification(restSpecs);
  }
  console.log("[form errors]", form.formState.errors);
  console.log("[form values]", form.getValues());

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
                <Input placeholder="Hopefully a hit" {...field} />
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

        <div className="space-y-2">
          <FormLabel className="text-xl font-medium">Variants</FormLabel>

          {variants.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed py-6">
              <PackageOpenIcon className="size-8" />
              <p className="text-muted-foreground text-sm">No variants added</p>
            </div>
          )}

          {variants.map((variant, index) => {
            return (
              <Collapsable
                key={variant.id}
                defaultOpen={index === 0}
                title={
                  <div className="flex flex-1 items-center justify-between gap-2 pr-4">
                    <FormField
                      control={form.control}
                      name={`variants.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Variant Name"
                              onClick={(e) => e.stopPropagation()}
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Button
                      variant="destructiveGhost"
                      size="icon"
                      onClick={() => removeVariant(index)}
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  </div>
                }
                className="space-y-4"
              >
                <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name={`variants.${index}.thumbnail`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thumbnail</FormLabel>
                        <FormControl>
                          <FileDropzone
                            onChange={field.onChange}
                            maxFiles={1}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`variants.${index}.images`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Images</FormLabel>
                        <FormControl>
                          <FileDropzone onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Collapsable>
            );
          })}

          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={() =>
              appendVariant({ name: "", thumbnail: undefined, images: [] })
            }
          >
            <PlusIcon className="size-4" />
            Add Variant
          </Button>
        </div>

        <div className="space-y-2">
          <FormLabel className="text-xl font-medium">Specifications</FormLabel>
          <div className="overflow-hidden rounded-lg border">
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
                  <TableRow key={field.id} className="hover:bg-transparent">
                    <TableCell className="ring-primary transition-all has-focus-within:inset-ring-2">
                      <FormField
                        control={form.control}
                        name={`specifications.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                onPaste={(e) => handleSpecsPaste(e, index)}
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
                        <p className="text-muted-foreground text-sm">
                          No specifications added
                        </p>
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
        </div>

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
