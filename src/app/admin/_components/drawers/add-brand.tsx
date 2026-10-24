"use client";

import { PlusIcon, TargetIcon } from "lucide-react";
import { useId } from "react";
import { Button } from "~/components/ui/button";
import { BrandForm, type BrandFormValues } from "../forms/brand-form";
import { toast } from "~/components/ui/toast";
import { useTRPC } from "~/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "~/components/spinner";
import {
  Drawer,
  DrawerContent,
  DrawerBody,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { useIsMobile } from "~/hooks/use-mobile";
import { useDialog } from "~/hooks/use-dialog";

export function AddBrandDrawer({
  variant = "ghost",
}: {
  variant?: "default" | "ghost";
}) {
  const formId = useId();
  const isMobile = useIsMobile();
  const drawer = useDialog();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutate: createBrand, isPending: isCreatingBrand } = useMutation(
    trpc.admin.brands.mutations.create.mutationOptions(),
  );

  function handleSubmit(data: BrandFormValues) {
    createBrand(data, {
      onSuccess: () => {
        toast.success("Brand created successfully");
        void queryClient.invalidateQueries(
          trpc.admin.brands.queries.getPage.pathFilter(),
        );
        drawer.dismiss();
      },
      onError: (error) => {
        toast.error(error.message || "Couldn't create the brand");
      },
    });
  }
  return (
    <Drawer {...drawer.props} swipeDirection={isMobile ? "down" : "right"}>
      <DrawerTrigger render={<Button variant={variant} />}>
        <PlusIcon data-icon="inline-start" />
        Add Brand
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex items-center gap-2">
            <TargetIcon />
            <DrawerTitle>Add Brand</DrawerTitle>
          </div>
          <DrawerDescription>Add a new brand to your store.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <BrandForm formId={formId} onSubmit={handleSubmit} />
        </DrawerBody>
        <DrawerFooter>
          <Button type="submit" form={formId} disabled={isCreatingBrand}>
            {isCreatingBrand ? (
              <Spinner size="small" data-icon="inline-start" />
            ) : (
              <PlusIcon data-icon="inline-start" />
            )}
            Create Brand
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
