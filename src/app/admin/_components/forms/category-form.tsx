"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm, useWatch } from "react-hook-form";
import type z from "zod";
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
import { categoryEntitySchema } from "~/lib/schemas/entities/category";
import { CategoriesCombobox } from "../inputs/categories-combobox";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectValue,
  SelectTrigger,
  SelectGroup,
} from "~/components/ui/select";
import { iconsMap } from "~/lib/icons-map";
import type { ArabicStatus } from "~/lib/arabic";
import { ArabicStatusBadge, MarkArabicReviewedButton } from "../arabic-status";
import { FileDropzone } from "../inputs/file-dropzone";
import { MediaStoreProvider } from "../../_stores/media/provider";
import type { SelectedMedia } from "../../_stores/media/store";

const categoryFormSchema = categoryEntitySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  slug: true,
});

/* the trigger shows the chosen icon (its name is hidden there), so the select gets them as its items */
const iconItems = Array.from(iconsMap.entries()).map(([key, Icon]) => ({
  value: key,
  label: (
    <div className="flex items-center gap-2">
      <Icon />
      <span className="truncate">{key.toLowerCase()}</span>
    </div>
  ),
}));

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export function CategoryForm({
  defaultValues,
  showParentCombobox = true,
  formId = "category-form",
  onSubmit,
  saved,
  defaultCover,
}: {
  defaultValues: Partial<CategoryFormValues>;
  defaultCover?: Pick<SelectedMedia, "mediaId" | "url">;
  showParentCombobox?: boolean;
  /** For the submit button's `form`; give each form open at once its own. */
  formId?: string;
  onSubmit: (data: CategoryFormValues) => void;
  /** The category as last saved, for the Arabic status; absent for a new one. */
  saved?: {
    id: number;
    arabicStatus: ArabicStatus;
    onArabicReviewed: () => void;
  };
}) {
  const arabicHeadingId = useId();
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: defaultValues.name ?? "",
      icon: defaultValues.icon ?? "CABLES",
      parent_id: defaultValues.parent_id ?? null,
      description: defaultValues.description ?? "",
      name_ar: defaultValues.name_ar ?? "",
      description_ar: defaultValues.description_ar ?? "",
      cover_media_id: defaultValues.cover_media_id ?? null,
    },
  });
  // only root categories get a home page tile
  const isRoot = useWatch({ control: form.control, name: "parent_id" }) == null;

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          void form.handleSubmit(onSubmit)(e);
        }}
        className="space-y-4"
        id={formId}
      >
        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <Select
                  items={iconItems}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      aria-label="Category icon"
                      className="w-16 gap-1 px-3 [&>span>div>span]:hidden"
                    >
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    <SelectGroup>
                      {iconItems.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>
                          {icon.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input placeholder="Category Name" {...field} autoFocus />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  className="h-24"
                  placeholder="Shown under the category title and as its search snippet"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isRoot && (
          <FormField
            control={form.control}
            name="cover_media_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Homepage image (optional)</FormLabel>
                <FormControl>
                  <MediaStoreProvider
                    maxFiles={1}
                    defaultMedia={defaultCover ? [defaultCover] : []}
                  >
                    <FileDropzone
                      onChange={(media) =>
                        field.onChange(media[0]?.mediaId ?? null)
                      }
                      uploadButtonVariant="outline"
                      showFiles
                    />
                  </MediaStoreProvider>
                </FormControl>
                <FormDescription>
                  Shown on the home page. Leave empty to use the newest
                  product&apos;s photo.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <div
          role="group"
          aria-labelledby={arabicHeadingId}
          className="space-y-4 border-t pt-4"
        >
          <div className="flex min-h-8 items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 id={arabicHeadingId} className="text-sm font-medium">
                Arabic
              </h3>
              <ArabicStatusBadge status={saved?.arabicStatus ?? "missing"} />
            </div>
            {saved?.arabicStatus === "draft" && (
              <MarkArabicReviewedButton
                target="categories"
                id={saved.id}
                onReviewed={saved.onArabicReviewed}
              />
            )}
          </div>
          <FormField
            control={form.control}
            name="name_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (Arabic)</FormLabel>
                <FormControl>
                  <Input
                    dir="rtl"
                    lang="ar"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description_ar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Arabic)</FormLabel>
                <FormControl>
                  <Textarea
                    dir="rtl"
                    lang="ar"
                    {...field}
                    value={field.value ?? ""}
                    className="h-24"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {showParentCombobox && (
          <FormField
            control={form.control}
            name="parent_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Category (optional)</FormLabel>
                <FormControl>
                  <CategoriesCombobox
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </form>
    </Form>
  );
}
