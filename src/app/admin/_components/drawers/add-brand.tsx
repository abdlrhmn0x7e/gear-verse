import { PlusCircleIcon, TargetIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { BrandForm, type BrandFormValues } from "../forms/brand-form";
import { toast } from "sonner";
import { api } from "~/trpc/react";
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

export function AddBrandDrawer() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const { mutate: createBrand, isPending: isCreatingBrand } =
    api.admin.brands.create.useMutation();
  const utils = api.useUtils();

  function handleSubmit(data: BrandFormValues) {
    createBrand(data, {
      onSuccess: () => {
        toast.success("Brand created successfully");
        void utils.admin.brands.getPage.invalidate();
        setOpen(false);
      },
    });
  }
  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      direction={isMobile ? "bottom" : "right"}
    >
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
