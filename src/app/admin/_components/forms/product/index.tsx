"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import z from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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
  const { append: appendVariant } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  return (
    <Form {...form}>
      <form
        id="product-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-3 gap-12 pb-24"
      >
        <div className="col-span-2 space-y-8">
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

          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
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

                <Variants control={form.control} />
              </div>
            </CardContent>
          </Card>
        </div>
        <div></div>
      </form>
    </Form>
  );
}
