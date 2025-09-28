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

const brandFormSchema = createBrandInputSchema;
export type BrandFormValues = z.infer<typeof brandFormSchema>;

export function BrandForm({
  onSubmit,
}: {
  onSubmit: (data: BrandFormValues) => void;
}) {
  const form = useForm<z.infer<typeof brandFormSchema>>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.stopPropagation();
          void form.handleSubmit(onSubmit)(e);
        }}
        id="brand-form"
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
                <MediaStoreProvider maxFiles={1}>
                  <FileDropzone
                    onChange={(media) => field.onChange(media[0]?.mediaId)}
                    showFiles
                  />
                </MediaStoreProvider>
              </FormControl>
              <FormDescription>
                Make sure this image is squared like your brain
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
