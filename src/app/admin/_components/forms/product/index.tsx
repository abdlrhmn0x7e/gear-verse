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
import { generateRandomId } from "~/lib/utils/generate-random-id";

const productFormSchema = createProductInputSchema
  .omit({
    media: true,
  })
  .extend({
    media: z.array(
      createProductMediaInputSchema.extend({
        url: z.url(),
      }),
    ),
    options: z.array(
      createProductOptionInputSchema.extend({
        id: z.number().positive(),
      }),
    ),
  });
export type ProductFormValues = z.infer<typeof productFormSchema>;

export const getDirtyFields = <
  TData extends
    | Record<keyof TDirtyItems, unknown>
    | Record<keyof TDirtyItems, undefined>,
  TDirtyItems extends Record<string, unknown>,
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
      profit: 0,
      margin: 0,
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
  });

  const {
    fields: optionFields,
    append: appendOption,
    swap: swapOption,
    remove: removeOption,
  } = useFieldArray({
    control: form.control,
    name: "options",
    keyName: "keyId",
    shouldUnregister: true,
  });

  function handleSubmit(data: ProductFormValues) {
    if (defaultValues) {
      // FIX: brand id isn't marked as dirty on first change
      const _data = getDirtyFields(data, form.formState.dirtyFields);

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
                      <Editor
                        onUpdate={field.onChange}
                        defaultContent={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <MediaStoreProvider>
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
                <Options
                  options={optionFields}
                  add={(id) => {
                    const valueId = generateRandomId();

                    appendOption({
                      id,
                      name: "",
                      values: [{ id: valueId, value: "" }],
                    });
                  }}
                  remove={(index) => removeOption(index)}
                  swap={swapOption}
                />
              </div>

              <Variants control={form.control} />
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

              <div className="grid grid-cols-2 items-start gap-2">
                <FormField
                  control={form.control}
                  name="profit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profit</FormLabel>
                      <FormControl>
                        <PriceInput {...field} />
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
                        <Input type="number" min={0} max={100} {...field} />
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
                      <div
                        className={cn(
                          "has-file:text-foreground placeholder:text-muted-foreground/60 selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                          "has-focus-within:border-ring has-focus-within:ring-ring/50 has-focus-within:ring-[3px]",
                          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                          "flex items-center gap-2",
                        )}
                      >
                        <p className="text-muted-foreground select-none">
                          {env.NEXT_PUBLIC_APP_URL.split("/")
                            .slice(1)
                            .join("/")
                            .slice(1)}
                          /
                        </p>
                        <input
                          placeholder="amogus-product"
                          className="flex-1 border-none focus-visible:outline-none"
                          {...field}
                        />
                      </div>
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
