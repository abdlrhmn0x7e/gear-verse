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
  const { mutate: updateVariant } = useMutation(
    trpc.admin.productVariants.mutations.update.mutationOptions({
      onSuccess: () => {
        toast.dismiss();
        router.push("/admin/inventory");
      },
    }),
  );

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
        options: Object.entries(variant.options).map(([name, value]) => ({
          [name]: value,
        })),
        overridePrice: variant.overridePrice ?? 0,
        thumbnail: {
          mediaId: variant.thumbnail?.id ?? 0,
          url: variant.thumbnail?.url ?? "",
        },
      }}
    />
  );
}
