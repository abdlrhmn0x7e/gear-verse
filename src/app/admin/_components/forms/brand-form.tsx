import { useForm } from "react-hook-form";
import { brandSchema } from "~/lib/schemas/brand";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { imageSchema } from "~/lib/schemas/image";
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

const brandFormSchema = brandSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    logoMediaId: true,
  })
  .and(
    z.object({
      logoImage: z.array(imageSchema),
    }),
  );
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
          name="logoImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo Image</FormLabel>
              <FormControl>
                <FileDropzone onChange={field.onChange} />
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
