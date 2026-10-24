"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SaveIcon, TargetIcon } from "lucide-react";
import { useId } from "react";

import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { toast } from "~/components/ui/toast";
import { useIsMobile } from "~/hooks/use-mobile";
import { useTRPC } from "~/trpc/client";
import { BrandForm, type BrandFormValues } from "../forms/brand-form";
import type { BrandRow } from "../tables/brands/columns";

export function EditBrandDrawer({
  brand,
  open,
  onOpenChange,
}: {
  brand: BrandRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const formId = useId();
  const isMobile = useIsMobile();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutate: updateBrand, isPending } = useMutation(
    trpc.admin.brands.mutations.update.mutationOptions({
      onSuccess: () => {
        toast.success("Brand updated successfully");
        void queryClient.invalidateQueries(
          trpc.admin.brands.queries.getPage.pathFilter(),
        );
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message || "Couldn't update the brand");
      },
    }),
  );

  function handleSubmit(values: BrandFormValues) {
    updateBrand({ id: brand.id, ...values });
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection={isMobile ? "down" : "right"}
    >
      <DrawerContent>
        <DrawerHeader>
          <div className="flex items-center gap-2">
            <TargetIcon />
            <DrawerTitle>Edit brand</DrawerTitle>
          </div>
          <DrawerDescription>Update the brand name or logo.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <BrandForm
            formId={formId}
            defaultValues={{
              name: brand.name,
              logoMediaId: brand.logo?.id,
            }}
            defaultLogo={
              brand.logo
                ? { mediaId: brand.logo.id, url: brand.logo.url }
                : undefined
            }
            onSubmit={handleSubmit}
          />
        </DrawerBody>
        <DrawerFooter>
          <Button type="submit" form={formId} disabled={isPending}>
            {isPending ? (
              <Spinner size="small" data-icon="inline-start" />
            ) : (
              <SaveIcon data-icon="inline-start" />
            )}
            Save changes
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
