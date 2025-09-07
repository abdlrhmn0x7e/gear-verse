import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { TrashIcon } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "sonner";

export function DeleteListingDialog({
  id,
  showText = true,
  variant = "destructive",
  onSuccess,
}: {
  id: number;
  showText?: boolean;
  variant?: "destructive" | "destructiveGhost";
  onSuccess?: () => void;
}) {
  const { mutate: deleteListing, isPending } = api.listing.delete.useMutation();

  function handleDeleteListing() {
    deleteListing(
      { id },
      {
        onSuccess: () => {
          toast.success("Listing deleted successfully");
          onSuccess?.();
        },
      },
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild disabled={isPending}>
        <Button variant={variant} size={showText ? "default" : "icon"}>
          <TrashIcon />
          {showText && "Delete listing"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            listing and remove its data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={handleDeleteListing}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
