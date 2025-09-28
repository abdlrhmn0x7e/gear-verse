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
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
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
} from "~/lib/schemas/entities/product";
import { MediaStoreProvider } from "../../../_stores/media/provider";
import { Editor } from "../../editor";
import { FileDropzone } from "../../inputs/file-dropzone";
import { MediaFields } from "./media";
import { Options } from "./options";
import { Variants } from "./variants";
import cuid from "cuid";

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
  });
export type ProductFormValues = z.infer<typeof productFormSchema>;

export function ProductForm({
  onSubmit,
  defaultValues,
}: {
  onSubmit: (data: ProductFormValues) => void;
  defaultValues?: Partial<ProductFormValues>;
}) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultValues ?? {
      title: "",
      summary: "",
      description: {},
      categoryId: 0,
      brandId: 0,
      media: [],
      options: [],
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
  });

  return (
    <Form {...form}>
      <form
        id="product-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-12 pb-24 lg:grid-cols-3"
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

          <Card className="gap-0 overflow-hidden pb-0">
            <CardHeader className="mb-4">
              <CardTitle>Variants</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 p-0">
              <div className="p-2">
                <Options
                  options={optionFields}
                  add={(id) => {
                    const valueId = cuid();

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
        <div></div>
      </form>
    </Form>
  );
}

function TotalInventory() {
  const form = useFormContext<ProductFormValues>();
  const variants = useWatch({ control: form.control, name: "variants" });
  if (!variants || variants.length === 0) return null;

  return (
    <CardFooter className="bg-muted justify-center border-t pb-4">
      <p className="text-muted-foreground text-sm">
        Total Inventory is{" "}
        {variants.reduce((acc, variant) => acc + Number(variant.stock), 0)}
      </p>
    </CardFooter>
  );
}
