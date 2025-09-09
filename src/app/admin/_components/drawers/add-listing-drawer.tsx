"use client";

import { IconShoppingBagPlus } from "@tabler/icons-react";
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
import { useUploadFileMutation } from "~/hooks/mutations/use-upload-file-mutation";
import { useIsMobile } from "~/hooks/use-mobile";
import { tryCatch } from "~/lib/utils/try-catch";
import { api } from "~/trpc/react";
import { useListingSearchParams } from "../../_hooks/use-listing-search-params";

export function AddListingDrawer() {
  const isMobile = useIsMobile();
  const [params, setParams] = useListingSearchParams();
  const utils = api.useUtils();
  const { mutateAsync: uploadFile, isPending: isUploading } =
    useUploadFileMutation();
  const { mutateAsync: createListing, isPending: isCreating } =
    api.listing.create.useMutation();
  const isSubmitting = isUploading || isCreating;

  function handleOpenChange(open: boolean) {
    if (open) {
      void setParams((prev) => ({ ...prev, type: "create" }));
      return;
    }

    void setParams((prev) => ({ ...prev, type: null }));
  }

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

    void utils.listing.getPage.invalidate();
    handleOpenChange(false);
    toast.dismiss(createLoadingToast);
    toast.success("Listing created successfully");
  }

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={!!params.type && params.type === "create"}
      onOpenChange={handleOpenChange}
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

        <ListingForm
          onSubmit={onSubmit}
          className="h-[calc(100vh-32rem)] overflow-y-auto p-4 sm:h-auto"
        />

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
