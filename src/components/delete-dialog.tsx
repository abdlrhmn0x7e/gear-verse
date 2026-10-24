"use client";

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
} from "./ui/alert-dialog";

// the admin has no intl provider, so the storefront passes its own copy and the admin gets this English
type DeleteDialogCopy =
  | { entity: string; description?: never }
  | { entity?: never; description: string };

type DeleteDialogProps = React.ComponentProps<typeof AlertDialog> &
  DeleteDialogCopy & {
    Trigger: React.ReactElement;
    disabled?: boolean;
    handleDelete?: () => void;
    title?: string;
    cancelLabel?: string;
    confirmLabel?: string;
  };

export function DeleteDialog({
  disabled,
  handleDelete,
  entity,
  description,
  title = "Are you absolutely sure?",
  cancelLabel = "Cancel",
  confirmLabel = "Continue",
  Trigger,
  ...props
}: DeleteDialogProps) {
  return (
    <AlertDialog {...props}>
      {Trigger && <AlertDialogTrigger render={Trigger} />}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description ??
              `This action cannot be undone. This will permanently delete the ${entity} and remove its data from our servers.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction disabled={disabled} onClick={handleDelete}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
