"use client";

import {
  Drawer,
  DrawerTitle,
  DrawerHeader,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
} from "~/components/ui/drawer";
import { useListingSearchParams } from "../../_hooks/use-listing-search-params";
import { api } from "~/trpc/react";
import { IconShoppingBagEdit } from "@tabler/icons-react";
import { ListingForm, type ListingFormValues } from "../forms/listing-form";
import { Button } from "~/components/ui/button";
import { useIsMobile } from "~/hooks/use-mobile";
import { useUploadFileMutation } from "~/hooks/mutations/use-upload-file-mutation";
import { tryCatch } from "~/lib/utils/try-catch";
import { toast } from "sonner";
import { Spinner } from "~/components/spinner";
import { Skeleton } from "~/components/ui/skeleton";
import { AlertTriangleIcon } from "lucide-react";

export function EditListingDrawer() {
  const isMobile = useIsMobile();
  const [params, setParams] = useListingSearchParams();

  function handleOpenChange(open: boolean) {
    if (open) {
      void setParams((prev) => ({ ...prev, type: null }));
      return;
    }

    void setParams((prev) => ({ ...prev, type: null }));
  }

  return (
    <Drawer
      open={!!params.type && !!params.listingId && params.type === "edit"}
      onOpenChange={handleOpenChange}
      direction={isMobile ? "bottom" : "right"}
    >
      <EditListingDrawerContent
        listingId={params.listingId ?? 0}
        handleDrawerClose={() => handleOpenChange(false)}
      />
    </Drawer>
  );
}

function EditListingDrawerContent({
  listingId,
  handleDrawerClose,
}: {
  listingId: number;
  handleDrawerClose: () => void;
}) {
  const utils = api.useUtils();
  const { mutateAsync: updateListing, isPending: updatingListing } =
    api.listing.update.useMutation();
  const { mutateAsync: uploadFile, isPending: uploadingFile } =
    useUploadFileMutation();
  const isSubmitting = updatingListing || uploadingFile;

  const {
    data: listing,
    isPending: listingPending,
    isError: listingError,
  } = api.listing.findById.useQuery(
    {
      id: listingId,
    },
    {
      enabled: !!listingId,
    },
  );

  if (listingPending) {
    return <EditListingDrawerSkeleton />;
  }

  if (listingError) {
    return <EditListingDrawerError />;
  }

  const onSubmit = async (data: ListingFormValues) => {
    if (!listingId) {
      return;
    }

    let thumbnailMediaId: number | undefined = undefined;
    if (data.thumbnail) {
      const thumbnailUploadToast = toast.loading("Uploading thumbnail...");
      const { data: thumbnailData, error: thumbnailError } = await tryCatch(
        uploadFile({
          file: data.thumbnail,
          ownerType: "LISTING",
          ownerId: listing?.id,
        }),
      );

      if (thumbnailError) {
        toast.error("Failed to upload thumbnail. Please try again.");
        toast.dismiss(thumbnailUploadToast);
        return;
      }

      toast.dismiss(thumbnailUploadToast);
      thumbnailMediaId = thumbnailData.mediaId;
    }

    const { products, ...rest } = data;
    const { error: listingError } = await tryCatch(
      updateListing({
        id: listingId,
        data: {
          ...rest,
          thumbnailMediaId,
        },
        products,
      }),
    );

    if (listingError) {
      toast.error("Failed to update listing. Please try again.");
      return;
    }

    void utils.listing.findFullById.invalidate({
      id: listingId,
    });
    void utils.listing.findById.invalidate({ id: listingId });
    void utils.listing.getPage.invalidate();
    toast.success("Listing updated successfully");
    handleDrawerClose();
  };
  return (
    <DrawerContent>
      <DrawerHeader>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
          <IconShoppingBagEdit className="mt-1.5 size-6 shrink-0" />
          <div>
            <DrawerTitle>Edit {listing.title} Listing</DrawerTitle>
            <DrawerDescription>Edit the listing details</DrawerDescription>
          </div>
        </div>
      </DrawerHeader>

      <ListingForm
        className="scroll-shadow h-[calc(100vh-32rem)] overflow-y-auto p-4 sm:h-auto"
        defaultValues={{
          title: listing.title,
          description: listing.description,
          price: listing.price,
          stock: listing.stock,
          products: listing.products?.map((product) => product.id),
        }}
        oldThumbnail={listing.thumbnail ?? undefined}
        onSubmit={onSubmit}
      />

      <DrawerFooter>
        <Button type="submit" form="listing-form" disabled={isSubmitting}>
          {isSubmitting ? <Spinner /> : <IconShoppingBagEdit />}
          Save Listing
        </Button>
      </DrawerFooter>
    </DrawerContent>
  );
}

function EditListingDrawerSkeleton() {
  return (
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle className="sr-only"></DrawerTitle>
        <DrawerDescription className="sr-only"></DrawerDescription>
        <div className="flex items-start gap-3">
          <Skeleton className="mt-1.5 size-6 shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </DrawerHeader>

      <div className="space-y-6 p-4">
        {/* Title field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Description field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-24 w-full" />
        </div>

        {/* Price and Stock fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Products combobox */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Thumbnail upload */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </div>

      <DrawerFooter>
        <Skeleton className="h-10 w-full" />
      </DrawerFooter>
    </DrawerContent>
  );
}

function EditListingDrawerError() {
  return (
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle className="sr-only"></DrawerTitle>
        <DrawerDescription className="sr-only"></DrawerDescription>
        <div className="flex items-start gap-3">
          <IconShoppingBagEdit className="mt-1.5 size-6 shrink-0" />
          <div>
            <DrawerTitle>Error</DrawerTitle>
            <DrawerDescription>
              An error occurred while loading the listing
            </DrawerDescription>
          </div>
        </div>
      </DrawerHeader>

      <div className="flex h-full flex-col items-center justify-center gap-3 p-4">
        <AlertTriangleIcon className="text-destructive size-24" />
        <div className="text-center">
          <p className="text-destructive text-lg">
            An error occurred while loading the listing
          </p>
          <p className="text-muted-foreground text-sm">
            Please try again later
          </p>
        </div>
      </div>
    </DrawerContent>
  );
}
