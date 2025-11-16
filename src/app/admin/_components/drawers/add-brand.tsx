import { PlusCircleIcon, TargetIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { BrandForm, type BrandFormValues } from "../forms/brand-form";
import { toast } from "sonner";
import { useTRPC } from "~/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Spinner } from "~/components/spinner";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { useIsMobile } from "~/hooks/use-mobile";
import { useDialog } from "~/hooks/use-dialog";

export function AddBrandDrawer() {
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
          trpc.admin.brands.queries.getPage.infiniteQueryFilter(),
        );
        drawer.dismiss();
      },
    });
  }
  return (
    <Drawer {...drawer.props} direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="ghost" className="w-full rounded-t-none">
          <PlusCircleIcon />
          Add Brand
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex items-center gap-2">
            <TargetIcon />
            <DrawerTitle>Add Brand</DrawerTitle>
          </div>
          <DrawerDescription>Add a new brand to your store.</DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <BrandForm onSubmit={handleSubmit} />
        </div>
        <DrawerFooter>
          <Button type="submit" form="brand-form" disabled={isCreatingBrand}>
            {isCreatingBrand ? <Spinner /> : <TargetIcon />}
            Create Brand
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
