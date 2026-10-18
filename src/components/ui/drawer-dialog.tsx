"use client";

import * as React from "react";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { useIsMobile } from "~/hooks/use-mobile";
import { cn } from "~/lib/utils";

/** What a dialog's part and a drawer's both accept, so one call renders either */
type SharedPartProps<P> = Omit<
  P,
  | "handle"
  | "payload"
  | "render"
  | "className"
  | "style"
  | "children"
  | "initialFocus"
  | "finalFocus"
> & {
  className?: string;
  render?: React.ReactElement;
  children?: React.ReactNode;
};

export function DrawerDialogTrigger({
  children,
  ...props
}: SharedPartProps<React.ComponentProps<typeof DialogTrigger>>) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return <DrawerTrigger {...props}>{children}</DrawerTrigger>;
  }

  return <DialogTrigger {...props}>{children}</DialogTrigger>;
}

export function DrawerDialogContent({
  children,
  showCloseButton,
  ...props
}: SharedPartProps<React.ComponentProps<typeof DialogContent>>) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <DrawerContent {...props} className={cn("px-4", props.className)}>
        {children}
      </DrawerContent>
    );
  }

  return (
    <DialogContent showCloseButton={showCloseButton} {...props}>
      {children}
    </DialogContent>
  );
}

export function DrawerDialogHeader({
  children,
  ...props
}: React.ComponentProps<typeof DialogHeader>) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return <DrawerHeader {...props}>{children}</DrawerHeader>;
  }
  return <DialogHeader {...props}>{children}</DialogHeader>;
}

export function DrawerDialogTitle({
  children,
  ...props
}: React.ComponentProps<typeof DialogTitle>) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return <DrawerTitle {...props}>{children}</DrawerTitle>;
  }
  return <DialogTitle {...props}>{children}</DialogTitle>;
}

export function DrawerDialogDescription({
  children,
  ...props
}: React.ComponentProps<typeof DialogDescription>) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return <DrawerDescription {...props}>{children}</DrawerDescription>;
  }
  return <DialogDescription {...props}>{children}</DialogDescription>;
}

export function DrawerDialogBody({
  children,
  ...props
}: React.ComponentProps<typeof DialogBody>) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return <DrawerBody {...props}>{children}</DrawerBody>;
  }
  return <DialogBody {...props}>{children}</DialogBody>;
}

export function DrawerDialogFooter({
  children,
  ...props
}: React.ComponentProps<typeof DialogFooter>) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return <DrawerFooter {...props}>{children}</DrawerFooter>;
  }
  return <DialogFooter {...props}>{children}</DialogFooter>;
}

export function DrawerDialog({
  children,
  ...props
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return <Dialog {...props}>{children}</Dialog>;
  }

  return <Drawer {...props}>{children}</Drawer>;
}
