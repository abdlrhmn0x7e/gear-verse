"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  VariantForm,
  type VariantFormValues,
} from "~/app/admin/_components/forms/variant-form";
import { api, type RouterOutputs } from "~/trpc/react";

export function EditVariant({
  variant,
}: {
  variant: RouterOutputs["admin"]["productVariants"]["queries"]["findById"];
}) {
  const router = useRouter();
  const { mutate: updateVariant } =
    api.admin.productVariants.mutations.update.useMutation({
      onSuccess: () => {
        toast.dismiss();
        router.push("/admin/inventory");
      },
    });

  function onSubmit(data: VariantFormValues) {
    toast.loading("Updating variant...");
    updateVariant(data);
  }

  return (
    <VariantForm
      onSubmit={onSubmit}
      className="col-span-2"
      defaultValues={{
        id: variant.id,
        inventory: variant.inventory ?? undefined,
        options: variant.options,
        overridePrice: variant.overridePrice ?? 0,
        thumbnail: {
          mediaId: variant.thumbnail?.id ?? 0,
          url: variant.thumbnail?.url ?? "",
        },
      }}
    />
  );
}
