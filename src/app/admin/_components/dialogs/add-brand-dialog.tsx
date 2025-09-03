import { PlusCircleIcon, TargetIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogFooter,
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "~/components/ui/drawer-dialog";
import { BrandForm, type BrandFormValues } from "../forms/brand-form";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useState } from "react";
import { useUploadFileMutation } from "~/hooks/mutations/use-upload-file-mutation";
import { Spinner } from "~/components/spinner";

export function AddBrandDialog() {
  const [open, setOpen] = useState(false);
  const { mutate: createBrand, isPending: isCreatingBrand } =
    api.brands.create.useMutation();
  const { mutate: uploadFile, isPending: isUploading } =
    useUploadFileMutation();
  const utils = api.useUtils();

  function handleSubmit(data: BrandFormValues) {
    const file = data.logoImage[0];
    if (!file) {
      toast.error("Please select a logo image");
      return;
    }

    uploadFile(
      { file },
      {
        onSuccess: (response) => {
          createBrand(
            { name: data.name, logoMediaId: response.mediaId },
            {
              onSuccess: () => {
                toast.success("Brand created successfully");
                void utils.brands.getPage.invalidate();
                setOpen(false);
              },
            },
          );
        },
      },
    );
  }
  return (
    <DrawerDialog open={open} onOpenChange={setOpen}>
      <DrawerDialogTrigger asChild>
        <Button variant="ghost" className="rounded-t-none">
          <PlusCircleIcon />
          Add Brand
        </Button>
      </DrawerDialogTrigger>
      <DrawerDialogContent>
        <DrawerDialogHeader>
          <div className="flex items-center gap-2">
            <TargetIcon />
            <DrawerDialogTitle>Add Brand</DrawerDialogTitle>
          </div>
          <DrawerDialogDescription>
            Add a new brand to your store.
          </DrawerDialogDescription>
        </DrawerDialogHeader>
        <BrandForm onSubmit={handleSubmit} />
        <DrawerDialogFooter>
          <Button
            type="submit"
            form="brand-form"
            disabled={isCreatingBrand || isUploading}
          >
            {isCreatingBrand || isUploading ? <Spinner /> : <TargetIcon />}
            Create Brand
          </Button>
        </DrawerDialogFooter>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
