"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
  type FieldErrors,
  type UseFormReturn,
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
  InputGroupText,
} from "~/components/ui/input-group";
import { InventoryTableInput } from "../../inputs/inventory-table-input";
import { getDirtyFields } from "~/lib/utils/get-dirty-fields";
import { AttributeCombobox } from "../../inputs/attributes-combobox";
import { getDiscountPercentage } from "~/components/features/products/product-card";
import { toast } from "~/components/ui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

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

const conditionItems = [
  { value: "NEW", label: "New" },
  { value: "USED", label: "Used" },
  { value: "REFURBISHED", label: "Refurbished" },
];

/** What each field is called on the page, to tell the admin where to look. */
const fieldLabels: Record<keyof ProductFormValues, string> = {
  title: "Title",
  summary: "Summary",
  description: "Description",
  media: "Media",
  inventory: "Inventory",
  options: "Variants",
  variants: "Variants",
  published: "Status",
  condition: "Condition",
  price: "Price",
  strikeThroughPrice: "Strike through price",
  originalCost: "Original cost",
  brandId: "Brand",
  categoryId: "Category",
  attributeIds: "Attributes",
  seo: "Search engine optimization",
};

export function ProductForm({
  onSubmit,
  onSubmitPartial,
  defaultValues,
  onFormReady,
}: {
  onSubmit?: (data: ProductFormValues) => void;
  onSubmitPartial?: (data: Partial<ProductFormValues>) => void;
  defaultValues?: Partial<ProductFormValues>;
  onFormReady?: (form: UseFormReturn<ProductFormValues>) => void;
}) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultValues ?? {
      title: "",
      summary: "",
      description: {},
      published: false,
      condition: "NEW",
      price: 0,
      categoryId: 0,
      brandId: 0,
      attributeIds: [],
      media: [],
      options: [],
      inventory: { quantity: 0 },
    },
  });

  useEffect(() => {
    onFormReady?.(form);
  }, [form, onFormReady]);

  const {
    fields: mediaFields,
    insert: insertMedia,
    move: moveMedia,
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
  const variants = useWatch({
    control: form.control,
    name: "variants",
    defaultValue: defaultValues?.variants,
  });
  const categoryId = useWatch({
    control: form.control,
    name: "categoryId",
    defaultValue: defaultValues?.categoryId,
  });
  const price = useWatch({
    control: form.control,
    name: "price",
    defaultValue: defaultValues?.price,
  });
  const strikeThroughPrice = useWatch({
    control: form.control,
    name: "strikeThroughPrice",
    defaultValue: defaultValues?.strikeThroughPrice,
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
    form.reset();
  }

  function handleInvalid(errors: FieldErrors<ProductFormValues>) {
    const labels = new Set(
      Object.keys(errors).map(
        (name) => fieldLabels[name as keyof ProductFormValues],
      ),
    );

    // one id, so pressing save again updates the toast instead of stacking another
    toast.error("Fix these before saving", {
      id: "product-form-invalid",
      description: [...labels].join(", "),
    });
  }

  return (
    <Form {...form}>
      <form
        id="product-form"
        onSubmit={form.handleSubmit(handleSubmit, handleInvalid)}
        className="mx-auto grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        <div className="min-w-0 space-y-8 lg:col-span-2">
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
                  <MediaFields media={mediaFields} move={moveMedia} />
                )}
              </MediaStoreProvider>
            </CardContent>
          </Card>

          {!variants?.length && (
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <InventoryTableInput data={[inventory ?? { quantity: 0 }]} />
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

        <div className="min-w-0 space-y-4">
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
                      <PriceInput placeholder="0" {...field} />
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
                        placeholder="0"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    {!!strikeThroughPrice && !!price && (
                      <FormDescription>
                        {strikeThroughPrice > price
                          ? `Shows as ${getDiscountPercentage(price, strikeThroughPrice)}% off the price.`
                          : "Set it above the price to show a discount."}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="originalCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Original Cost</FormLabel>
                    <FormControl>
                      <PriceInput
                        placeholder="0"
                        {...field}
                        value={field.value ?? 0}
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

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select
                      items={conditionItems}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {conditionItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attributeIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attributes</FormLabel>
                    <FormControl>
                      <AttributeCombobox
                        value={field.value ?? []}
                        categoryId={categoryId}
                        onValueChange={field.onChange}
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
                          <InputGroupText className="truncate">
                            {new URL(env.NEXT_PUBLIC_APP_URL).host}/products/
                          </InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                          placeholder="sussy-product"
                          className="pl-0.5"
                          {...field}
                        />
                      </InputGroup>
                    </FormControl>
                    <FormDescription>
                      The end of the product&apos;s address. Use lowercase
                      letters, numbers and hyphens, unique to this product.
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
