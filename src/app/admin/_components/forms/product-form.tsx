"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import cuid from "cuid";
import {
  useFieldArray,
  useForm,
  useFormContext,
  type FieldArrayWithId,
  type UseFieldArrayAppend,
  type UseFieldArrayRemove,
  type UseFieldArraySwap,
} from "react-hook-form";
import z from "zod";

import { ImageIcon, PlusCircleIcon, PlusIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  createProductInputSchema,
  createProductMediaInputSchema,
} from "~/lib/schemas/entities/product";
import { cn } from "~/lib/utils";
import {
  MediaStoreProvider,
  useMediaStore,
} from "../../_stores/media/provider";
import { Editor } from "../editor";
import { FileDropzone, MediaDialog } from "../inputs/file-dropzone";

import {
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  rectSwappingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "motion/react";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { Badge } from "~/components/ui/badge";
import { useDebounce } from "~/hooks/use-debounce";
import {
  SwapableContext,
  SwapableItem,
  SwapableItemWithHandle,
} from "../swapable-context";

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
                  add={(id) =>
                    appendOption({
                      id,
                      name: "",
                      values: [{ value: "" }],
                    })
                  }
                  remove={(index) => removeOption(index)}
                  swap={swapOption}
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

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [checkedMedia, setCheckedMedia] = useState<ProductFormValues["media"]>(
    [],
  );

  // sensors managed by `SwapableContext`

  const { setValue } = useFormContext<ProductFormValues>();

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = media.findIndex((m) => m.mediaId === active.id);
      const newIndex = media.findIndex((m) => m.mediaId === over?.id);

      if (oldIndex === -1 || newIndex === -1) return;

      swap(oldIndex, newIndex);

      setActiveId(null);
    }
  }

  function handleCheckboxChange(media: ProductFormValues["media"][number]) {
    return (checked: boolean) =>
      setCheckedMedia((prev) =>
        checked
          ? [...prev, media]
          : prev.filter((m) => m.mediaId !== media.mediaId),
      );
  }

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

      <SwapableContext
        items={media.map((m) => m.mediaId)}
        strategy={rectSwappingStrategy}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <div className="relative flex flex-wrap gap-2">
          {media.map((m) => (
            <div key={`${m.mediaId}-container`} className="peer group relative">
              <SwapableItem id={m.mediaId} className="size-32 rounded-lg">
                <MediaItem
                  media={m}
                  className="transition-opacity duration-1000 group-active:opacity-20"
                />

                <Checkbox
                  className="absolute top-2 left-2 z-10 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-0 data-[state=checked]:opacity-100"
                  checked={checkedMedia.some((m2) => m2.mediaId === m.mediaId)}
                  onCheckedChange={handleCheckboxChange(m)}
                  onPointerDown={(e) => e.stopPropagation()}
                />
              </SwapableItem>
            </div>
          ))}

          <MediaDialog>
            <button
              type="button"
              className="hover:bg-muted flex size-32 cursor-pointer items-center justify-center rounded-lg border border-dashed p-2 transition-colors"
            >
              <PlusIcon />
            </button>
          </MediaDialog>

          <Badge className="absolute top-24 left-6 z-10 peer-has-active:z-[9999]">
            <ImageIcon />
            Thumbnail
          </Badge>
        </div>

        <DragOverlay>
          {activeId ? (
            <MediaItem media={media.find((m) => m.mediaId === activeId)!} />
          ) : null}
        </DragOverlay>
      </SwapableContext>

      <p className="text-muted-foreground text-sm">
        The first media will be used as the main image.
      </p>
    </div>
  );
}

function MediaItem({
  media,
  className,
}: {
  media: ProductFormValues["media"][number];
  className?: string;
}) {
  return (
    <AspectRatio ratio={1} className="size-32">
      <div
        className={cn(
          "pointer-events-none size-full overflow-hidden rounded-md border select-none",
          className,
        )}
      >
        <Image
          src={media.url}
          alt={`Selected Media ${media.mediaId}`}
          width={256}
          height={256}
          className="size-full object-cover"
        />
      </div>
    </AspectRatio>
  );
}

function Options({
  options,
  add,
  remove,
  swap,
}: {
  options: FieldArrayWithId<ProductFormValues, "options", "id">[];
  add: (id: string) => void;
  remove: (index: number) => void;
  swap: UseFieldArraySwap;
}) {
  const [openOptions, setOpenOptions] = useState<string[]>([]);

  function toggleOpen(id: string) {
    setOpenOptions((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  function handleRemove(id: string) {
    setOpenOptions((prev) => prev.filter((i) => i !== id));
    remove(options.findIndex((o) => o.id === id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = options.findIndex((o) => o.id === active.id);
      const newIndex = options.findIndex((o) => o.id === over?.id);

      if (oldIndex === -1 || newIndex === -1) return;

      swap(oldIndex, newIndex);
    }
  }

  function handleAddOption() {
    const newId = cuid();
    setOpenOptions((prev) => [...prev, newId]);
    add(newId);
  }

  if (options.length === 0) {
    return (
      <div className="space-y-2">
        <Button type="button" variant="ghost" onClick={handleAddOption}>
          <PlusCircleIcon />
          Add Options like color, connectivity, etc.
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SwapableContext
        items={options.map((option) => option.id)}
        strategy={verticalListSortingStrategy}
        onDragEnd={handleDragEnd}
      >
        {options.map((option, index) => (
          <SwapableItemWithHandle
            key={option.id}
            id={option.id}
            disabled={openOptions.length > 0}
            className="bg-card items-start rounded-lg border pt-6 pr-2 pb-2 pl-4"
          >
            <Option
              key={option.id}
              id={option.id}
              index={index}
              open={openOptions.includes(option.id)}
              toggleOpen={() => toggleOpen(option.id)}
              remove={() => handleRemove(option.id)}
            />
          </SwapableItemWithHandle>
        ))}
      </SwapableContext>

      <Button type="button" variant="ghost" onClick={handleAddOption}>
        <PlusCircleIcon />
        Add Another Option
      </Button>
    </div>
  );
}

function Option({
  id,
  index,
  open,
  toggleOpen,
  remove,
}: {
  id: UniqueIdentifier;
  index: number;
  open: boolean;
  toggleOpen: () => void;
  remove: () => void;
}) {
  const form = useFormContext<ProductFormValues>();

  const option = form.getValues("options")[index];

  async function handleDone() {
    const isValid = await form.trigger(`options.${index}`);

    if (isValid) {
      toggleOpen();
    }
  }

  function renderOptionContent() {
    if (!open) {
      if (!option) return null;

      return (
        <motion.button
          key={`option-closed-${id}`}
          type="button"
          onClick={toggleOpen}
          className="hover:bg-muted -mt-4 flex min-h-16 w-full flex-col items-start rounded-lg px-3 py-2 transition-colors"
          initial={{ opacity: 0, y: 16, height: 100 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -16, height: "auto" }}
          transition={{ duration: 0.1, ease: "easeOut" }}
        >
          <p className="font-medium">{option.name}</p>
          {option.values.length > 0 && (
            <div className="text-muted-foreground flex flex-wrap gap-1 text-sm">
              {option.values.map((v) => (
                <Badge key={v.value} variant="outline">
                  {v.value}
                </Badge>
              ))}
            </div>
          )}
        </motion.button>
      );
    }

    return (
      <motion.div
        key={`option-open-${id}`}
        className="space-y-4"
        initial={{ opacity: 0, y: 16, height: 100 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -16, height: "auto" }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      >
        <OptionFields index={index} />

        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={remove}
          >
            Delete
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDone}
          >
            Done
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {renderOptionContent()}
    </AnimatePresence>
  );
}

function OptionFields({ index }: { index: number }) {
  const [addValue, setAddValue] = useState("");
  const addValueInputRef = useRef<HTMLInputElement>(null);

  const form = useFormContext<ProductFormValues>();
  const debouncedAddValue = useDebounce(addValue, 500);

  useEffect(() => {
    if (debouncedAddValue.length > 0) {
      appendValue({ value: debouncedAddValue }, { shouldFocus: true });
      setAddValue("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedAddValue]);

  const {
    fields: valueFields,
    append: appendValue,
    remove: removeValue,
    swap: swapValues,
  } = useFieldArray({
    control: form.control,
    name: `options.${index}.values`,
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = valueFields.findIndex((v) => v.id === active.id);
      const newIndex = valueFields.findIndex((v) => v.id === over?.id);

      if (oldIndex === -1 || newIndex === -1) return;

      swapValues(oldIndex, newIndex);
    }
  }

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={`options.${index}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Option Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="space-y-2">
        <Label>Option Values</Label>
        <SwapableContext
          items={valueFields.map((value) => value.id)}
          strategy={verticalListSortingStrategy}
          onDragEnd={handleDragEnd}
        >
          {valueFields.map((value, valueIndex) => (
            <SwapableItemWithHandle key={value.id} id={value.id}>
              <OptionValueField
                index={index}
                valueIndex={valueIndex}
                valueFields={valueFields}
                appendValue={appendValue}
                removeValue={removeValue}
              />
            </SwapableItemWithHandle>
          ))}

          <div className="ml-6">
            <Input
              placeholder="Add Another Value"
              ref={addValueInputRef}
              value={addValue}
              className="w-full"
              onChange={(e) => setAddValue(e.target.value)}
            />
          </div>
        </SwapableContext>
      </div>
    </div>
  );
}

function OptionValueField({
  index,
  valueIndex,
  valueFields,
  removeValue,
  className,
}: {
  index: number;
  valueIndex: number;
  valueFields: FieldArrayWithId<ProductFormValues, "options", "id">["values"];
  appendValue: UseFieldArrayAppend<ProductFormValues>;
  removeValue: UseFieldArrayRemove;
  className?: string;
}) {
  const form = useFormContext<ProductFormValues>();

  return (
    <FormField
      control={form.control}
      name={`options.${index}.values.${valueIndex}.value`}
      render={({ field }) => (
        <FormItem className={cn("relative", className)}>
          <FormControl>
            <Input
              placeholder={
                valueIndex === 0 ? "Some Value" : "Add Another Value"
              }
              value={field.value}
              onChange={field.onChange}
            />
          </FormControl>

          {valueFields.length > 1 && (
            <Button
              type="button"
              variant="destructiveGhost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
              size="icon"
              onClick={() => removeValue(valueIndex)}
            >
              <TrashIcon />
            </Button>
          )}
        </FormItem>
      )}
    />
  );
}
