"use client";
// Swapy is handled via the shared Swapably component

import {
  useFieldArray,
  useForm,
  useFormContext,
  type UseFieldArraySwap,
} from "react-hook-form";
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
import {
  createProductInputSchema,
  createProductMediaInputSchema,
} from "~/lib/schemas/entities/product";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Editor } from "../editor";
import { FileDropzone, MediaDialog } from "../inputs/file-dropzone";
import React, { useEffect, useState } from "react";
import { PlusCircleIcon, PlusIcon, TrashIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import Image from "next/image";
import { cn } from "~/lib/utils";
import { Checkbox } from "~/components/ui/checkbox";
import {
  MediaStoreProvider,
  useMediaStore,
} from "../../_stores/media/provider";
import { Swapably } from "../inputs/swapably";

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

  const { fields: optionFields, append: appendOption } = useFieldArray({
    control: form.control,
    name: "options",
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
                <OptionFields
                  options={optionFields}
                  add={() =>
                    appendOption({
                      name: "",
                      values: [],
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
        <div></div>
      </form>
    </Form>
  );
}

function MediaFields({
  media,
  swap,
}: {
  media: ProductFormValues["media"];
  swap: UseFieldArraySwap;
}) {
  const selectedMedia = useMediaStore((state) => state.selectedMedia);
  const setSelectedMedia = useMediaStore((state) => state.setSelectedMedia);

  const { setValue } = useFormContext<ProductFormValues>();
  const [checkedMedia, setCheckedMedia] = useState<ProductFormValues["media"]>(
    [],
  );

  useEffect(() => {
    setValue("media", selectedMedia);
    setCheckedMedia([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMedia]);

  return (
    <div className="space-y-2">
      {checkedMedia.length > 0 ? (
        <div className="flex h-9 items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={
                checkedMedia.length === media.length
                  ? true
                  : checkedMedia.length === 0
                    ? false
                    : "indeterminate"
              }
              onCheckedChange={(checked) => {
                if (checked) {
                  setCheckedMedia(selectedMedia);
                } else {
                  setCheckedMedia([]);
                }
              }}
            />

            <Label htmlFor="select-all">{checkedMedia.length} selected</Label>
          </div>

          <Button
            variant="destructive"
            size="sm"
            type="button"
            onClick={() => {
              setSelectedMedia(
                selectedMedia.filter(
                  (m) => !checkedMedia.some((m2) => m2.mediaId === m.mediaId),
                ),
              );
            }}
          >
            <TrashIcon />
            Delete Selected
          </Button>
        </div>
      ) : (
        <Label className="h-9">Media</Label>
      )}

      <Swapably
        items={media}
        getId={(m) => m.mediaId}
        onSwap={(event) => {
          const from = Number(event.fromSlot) - 1;
          const to = Number(event.toSlot) - 1;
          swap(from, to);
        }}
        containerClassName="grid grid-cols-[repeat(auto-fill,100px)] grid-rows-[repeat(auto-fill,100px)] gap-2"
        slotClassName={(index) =>
          cn(index === 0 && "col-span-2 row-span-2 size-full")
        }
        itemClassName={() =>
          "group relative size-full overflow-hidden rounded-lg border transition-opacity hover:cursor-grab hover:opacity-80 active:cursor-grabbing"
        }
        Comp={({ item: media }) => (
          <>
            <Image
              src={media.url}
              alt={media.mediaId.toString()}
              className="size-full object-cover"
              width={256}
              height={256}
            />
            <Checkbox
              className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100"
              checked={checkedMedia.some((m) => m.mediaId === media.mediaId)}
              onCheckedChange={(checked) => {
                setCheckedMedia((prev) =>
                  checked
                    ? [...prev, media]
                    : prev.filter((m) => m.mediaId !== media.mediaId),
                );
              }}
            />
          </>
        )}
      >
        <MediaDialog onChange={(media) => setValue("media", media)}>
          <div className="bg-card hover:bg-muted flex size-full items-center justify-center rounded-lg border border-dashed transition-colors hover:cursor-pointer">
            <PlusIcon className="size-5" />
          </div>
        </MediaDialog>
      </Swapably>
    </div>
  );
}

function OptionFields({
  options,
  add,
}: {
  options: ProductFormValues["options"];
  add: () => void;
}) {
  if (options.length === 0) {
    return (
      <div className="space-y-2">
        <Button type="button" variant="ghost" onClick={add}>
          <PlusCircleIcon />
          Add Options like color, connectivity, etc.
        </Button>
      </div>
    );
  }

  return <div>OptionFields</div>;
}
