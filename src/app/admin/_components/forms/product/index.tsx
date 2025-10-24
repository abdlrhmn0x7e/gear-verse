"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
import z from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  createProductInputSchema,
  createProductMediaInputSchema,
  createProductOptionInputSchema,
} from "~/lib/schemas/entities/product";
import { MediaStoreProvider } from "../../../_stores/media/provider";
import { Editor } from "../../editor";
import { FileDropzone } from "../../inputs/file-dropzone";
import { MediaFields } from "./media";
import { Options } from "./options";
import { Variants } from "./variants";
import { BrandsCombobox } from "../../inputs/brands-combobox";
import { CategoriesCombobox } from "../../inputs/categories-combobox";
import { env } from "~/env";
import { cn } from "~/lib/utils";
import { Switch } from "~/components/ui/switch";
import { TriangleAlertIcon } from "lucide-react";
import { PriceInput } from "../../inputs/price-input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupNumberInput,
  InputGroupText,
} from "~/components/ui/input-group";
import { InventoryTableInput } from "../../inputs/inventory-table-input";

const productFormSchema = createProductInputSchema
  .omit({
    media: true,
  })
  .extend({
    media: z
      .array(
        createProductMediaInputSchema.extend({
          url: z.url(),
        }),
      )
      .min(1, "At least one media is required"),
    options: z.array(
      createProductOptionInputSchema.extend({
        id: z.number().positive(),
      }),
    ),
  });
export type ProductFormValues = z.infer<typeof productFormSchema>;

export const getDirtyFields = <
  TData extends
    | Partial<Record<keyof TDirtyItems, unknown>>
    | Partial<Record<keyof TDirtyItems, null>>,
  TDirtyItems extends Partial<Record<string, unknown>>,
>(
  formValues: TData,
  dirtyItems: TDirtyItems,
): Partial<TData> => {
  return Object.entries(dirtyItems).reduce((dirtyData, [key, value]) => {
    // react hook form considers removed array fields as dirty
    // so we need to check if the form value is not undefined
    const formValue = formValues?.[key];

    if (value === false) return dirtyData;
    if (value === true) return { ...dirtyData, [key]: formValue };
    if (!formValue) return formValues; // if the form value is not found, return the dirty data

    const child = getDirtyFields(
      formValues[key] as TData,
      dirtyItems[key] as TDirtyItems,
    );

    if (typeof child === "object" && Object.keys(child).length === 0) {
      return dirtyData;
    }

    // if the form value is an array, return the whole array
    if (Array.isArray(formValue)) {
      return {
        ...dirtyData,
        [key]: formValue,
      };
    }

    if (Array.isArray(child) && child.length === 0) {
      return dirtyData;
    }

    return {
      ...dirtyData,
      [key]: child,
    };
  }, {});
};

export function ProductForm({
  onSubmit,
  onSubmitPartial,
  defaultValues,
}: {
  onSubmit?: (data: ProductFormValues) => void;
  onSubmitPartial?: (data: Partial<ProductFormValues>) => void;
  defaultValues?: Partial<ProductFormValues>;
}) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultValues ?? {
      title: "",
      summary: "",
      description: {},
      published: false,
      price: 0,
      categoryId: 0,
      brandId: 0,
      media: [],
      options: [],
      seo: {
        pageTitle: "",
        urlHandler: "",
        metaDescription: "",
      },
    },
  });

  const {
    fields: mediaFields,
    insert: insertMedia,
    swap: swapMedia,
  } = useFieldArray({
    control: form.control,
    name: "media",
    rules: {
      minLength: 1,
    },
  });

  const inventory = useWatch({
    control: form.control,
    name: "inventory",
    defaultValue: defaultValues?.inventory,
  });

  // you have to subscribe to the dirty fields here
  // accessing it directly from the onSubmit function won't work
  // because the form state is not updated yet
  const { dirtyFields } = form.formState;

  function handleSubmit(data: ProductFormValues) {
    if (defaultValues) {
      // FIX: brand id isn't marked as dirty on first change
      const _data = getDirtyFields(data, dirtyFields);

      onSubmitPartial?.(_data);
      return;
    }

    onSubmit?.(data);
  }

  return (
    <Form {...form}>
      <form
        id="product-form"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="grid grid-cols-1 gap-6 pb-24 lg:grid-cols-3"
      >
        <div className="space-y-8 lg:col-span-2">
          <Card>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-2">
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
                name="summary"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Textarea className="h-24" {...field} />
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
                      <MediaStoreProvider>
                        <Editor
                          onUpdate={field.onChange}
                          defaultContent={field.value}
                        />
                      </MediaStoreProvider>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <MediaStoreProvider defaultMedia={defaultValues?.media}>
                {mediaFields.length === 0 ? (
                  <FormField
                    control={form.control}
                    name="media"
                    render={() => (
                      <FormItem className="space-y-2">
                        <FormLabel>Media</FormLabel>
                        <FormControl>
                          <FileDropzone
                            onChange={(media) => insertMedia(0, media)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <MediaFields media={mediaFields} swap={swapMedia} />
                )}
              </MediaStoreProvider>
            </CardContent>
          </Card>

          {inventory && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Inventory</CardTitle>
                  <div className="pointer-events-none flex items-center gap-2 opacity-50">
                    <p className="text-muted-foreground text-sm">
                      Inventory tracked (you want this?)
                    </p>

                    <Switch />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <InventoryTableInput data={[inventory]} />
              </CardContent>
            </Card>
          )}

          <Card
            className={cn(
              "gap-0 overflow-hidden pb-0",
              form.formState.errors.options && "border-destructive",
            )}
          >
            <CardHeader className="mb-4">
              <CardTitle>Variants</CardTitle>
              <CardDescription>
                {form.formState.errors.options && (
                  <FormMessage className="text-destructive flex items-center gap-2">
                    <TriangleAlertIcon className="size-4" />
                    {form.formState.errors.options.message}
                  </FormMessage>
                )}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 p-0">
              <div className="p-2">
                <FormField
                  control={form.control}
                  name="options"
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <Options />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="variants"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Variants
                        optionsDefaultValues={defaultValues?.options ?? []}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
            <TotalInventory />
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="gap-3">
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-2">
                      <FormLabel>
                        Make this product public immediately
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <PriceInput placeholder="0 dollarz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="strikeThroughPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Strike Through Price (optional)</FormLabel>
                    <FormControl>
                      <PriceInput
                        placeholder="0 dollaz?"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 items-start gap-4">
                <FormField
                  control={form.control}
                  name="profit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profit</FormLabel>
                      <FormControl>
                        <PriceInput
                          placeholder="Profit?!"
                          {...field}
                          value={field.value ?? 0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="margin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Margin</FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupNumberInput
                            placeholder="How much profit?"
                            min={0}
                            max={100}
                            {...field}
                            value={field.value ?? 0}
                          />
                          <InputGroupAddon>
                            <p className="text-muted-foreground select-none">
                              %
                            </p>
                          </InputGroupAddon>
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meta data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="brandId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <BrandsCombobox
                        onValueChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <CategoriesCombobox
                        onValueChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Search engine optimization{" "}
                <span className="text-muted-foreground text-sm">
                  (optional)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="seo.pageTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page title</FormLabel>
                    <FormControl>
                      <Input placeholder="Sus product" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seo.urlHandler"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL handler </FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupAddon>
                          <InputGroupText>
                            {env.NEXT_PUBLIC_APP_URL.split("/")
                              .slice(1)
                              .join("/")
                              .slice(1)}
                            /
                          </InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                          placeholder="sussy-product"
                          className="!pl-0.5"
                          {...field}
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupText>.com</InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                    </FormControl>
                    <FormDescription>
                      This will be used as the URL handler for the product. it
                      should be a lowercase string with no spaces and unique per
                      product.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seo.metaDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta description</FormLabel>
                    <FormControl>
                      <Textarea className="h-24" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
}

function TotalInventory() {
  const form = useFormContext<ProductFormValues>();
  const variants = useWatch({ control: form.control, name: "variants" });
  if (!variants || variants.length === 0) return null;

  return (
    <CardFooter className="bg-muted justify-center border-t pb-4 [.border-t]:pt-4">
      <p className="text-muted-foreground text-sm">
        Total Inventory is{" "}
        {variants.reduce((acc, variant) => acc + Number(variant.stock), 0)}
      </p>
    </CardFooter>
  );
}
