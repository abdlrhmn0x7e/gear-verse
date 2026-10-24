import { useForm } from "react-hook-form";
import { createBrandInputSchema } from "@schemas/entities/brand";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { FileDropzone } from "../inputs/file-dropzone";
import { MediaStoreProvider } from "../../_stores/media/provider";
import type { SelectedMedia } from "../../_stores/media/store";

const brandFormSchema = createBrandInputSchema;
export type BrandFormValues = z.infer<typeof brandFormSchema>;

export function BrandForm({
  onSubmit,
  defaultValues,
  defaultLogo,
  formId,
}: {
  onSubmit: (data: BrandFormValues) => void;
  defaultValues?: Partial<BrandFormValues>;
  defaultLogo?: Pick<SelectedMedia, "mediaId" | "url">;
  formId: string;
}) {
  const form = useForm<z.infer<typeof brandFormSchema>>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: "",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          void form.handleSubmit(onSubmit)(e);
        }}
        id={formId}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logoMediaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo Image</FormLabel>
              <FormControl>
                <MediaStoreProvider
                  maxFiles={1}
                  defaultMedia={defaultLogo ? [defaultLogo] : []}
                >
                  <FileDropzone
                    onChange={(media) => field.onChange(media[0]?.mediaId)}
                    uploadButtonVariant="outline"
                    showFiles
                  />
                </MediaStoreProvider>
              </FormControl>
              <FormDescription>
                Use a square image. It shows at small sizes next to product
                names.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
