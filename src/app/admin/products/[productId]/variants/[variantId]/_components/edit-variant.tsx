"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  VariantForm,
  type VariantFormValues,
} from "~/app/admin/_components/forms/variant-form";
import { useTRPC, type RouterOutput } from "~/trpc/client";

export function EditVariant({
  variant,
}: {
  variant: RouterOutput["admin"]["productVariants"]["queries"]["findById"];
}) {
  const router = useRouter();
  const trpc = useTRPC();
  const { mutateAsync: updateVariant, isPending } = useMutation(
    trpc.admin.productVariants.mutations.update.mutationOptions(),
  );

  async function onSubmit(data: VariantFormValues) {
    const toastId = toast.loading("Updating variant...");

    try {
      await updateVariant(data);
      toast.success("Variant updated", { id: toastId });
      router.push("/admin/inventory");
    } catch (error) {
      toast.error(
        error instanceof Error && error.message
          ? error.message
          : "Couldn't update the variant. Try again.",
        { id: toastId },
      );
      // the form keeps the edits so they can be saved again
      throw error;
    }
  }

  return (
    <VariantForm
      onSubmit={onSubmit}
      isSubmitting={isPending}
      className="col-span-2"
      defaultValues={{
        id: variant.id,
        inventory: variant.inventory ?? undefined,
        options: Object.entries(variant.options).map(([name, value]) => ({
          [name]: value,
        })),
        overridePrice: variant.overridePrice ?? 0,
        thumbnail: variant.thumbnail
          ? {
              mediaId: variant.thumbnail.id,
              url: variant.thumbnail.url,
            }
          : undefined,
      }}
    />
  );
}
