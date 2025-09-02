"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
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
import { cn } from "~/lib/utils";

export function DrawerDialogTrigger({
  children,
  ...props
}: React.ComponentProps<typeof DialogTrigger>) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return <DrawerTrigger {...props}>{children}</DrawerTrigger>;
  }

  return <DialogTrigger {...props}>{children}</DialogTrigger>;
}

export function DrawerDialogContent({
  children,
  ...props
}: React.ComponentProps<typeof DialogContent>) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <DrawerContent className={cn("px-4", props.className)} {...props}>
        {children}
      </DrawerContent>
    );
  }

  return <DialogContent {...props}>{children}</DialogContent>;
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
}: React.ComponentProps<typeof Dialog>) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return <Dialog {...props}>{children}</Dialog>;
  }

  return <Drawer {...props}>{children}</Drawer>;
}
