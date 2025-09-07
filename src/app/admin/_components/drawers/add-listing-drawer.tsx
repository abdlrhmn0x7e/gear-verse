"use client";

import { IconShoppingBagPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  ListingForm,
  type ListingFormValues,
} from "~/app/admin/_components/forms/listing-form";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useUploadFileMutation } from "~/hooks/mutations/use-upload-file-mutation";
import { useIsMobile } from "~/hooks/use-mobile";
import { tryCatch } from "~/lib/utils/try-catch";
import { api } from "~/trpc/react";

export function AddListingDrawer() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { mutateAsync: uploadFile, isPending: isUploading } =
    useUploadFileMutation();
  const { mutateAsync: createListing, isPending: isCreating } =
    api.listing.create.useMutation();
  const isSubmitting = isUploading || isCreating;

  async function onSubmit(data: ListingFormValues) {
    const { thumbnail, ...rest } = data;
    if (!thumbnail) {
      toast.error("Please upload a thumbnail image");
      return;
    }

    const loadingToast = toast.loading("Uploading thumbnail image");
    const { data: media, error: fileUploadError } = await tryCatch(
      uploadFile({ file: thumbnail }),
    );

    if (fileUploadError) {
      toast.dismiss(loadingToast);
      toast.error("Failed to upload thumbnail image");
      return;
    }

    toast.dismiss(loadingToast);
    const createLoadingToast = toast.loading("Creating listing");
    const { error: createListingError } = await tryCatch(
      createListing({ ...rest, thumbnailMediaId: media.mediaId }),
    );

    if (createListingError) {
      toast.dismiss(createLoadingToast);
      toast.error("Failed to create listing");
      return;
    }

    router.refresh();
    setOpen(false);
    toast.dismiss(createLoadingToast);
    toast.success("Listing created successfully");
  }

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={setOpen}
    >
      <DrawerTrigger asChild>
        <Button size="lg">
          <IconShoppingBagPlus />
          Create a new listing
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            <IconShoppingBagPlus className="mt-1 size-6 shrink-0" />
            <div>
              <DrawerTitle>Create a new listing</DrawerTitle>
              <DrawerDescription>
                {
                  "Create a new listing to start selling your products. let's get that that fat ass money"
                }
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <ScrollArea>
          <ListingForm
            onSubmit={onSubmit}
            className="h-[calc(100vh-32rem)] p-4"
          />
        </ScrollArea>

        <DrawerFooter>
          <Button type="submit" form="listing-form" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : <IconShoppingBagPlus />}
            Submit
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
