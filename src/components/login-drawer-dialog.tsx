"use client";

import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogHeader,
  DrawerDialogTrigger,
  DrawerDialogTitle,
  DrawerDialogBody,
  DrawerDialogDescription,
} from "./ui/drawer-dialog";
import { useMutation } from "@tanstack/react-query";
import { Spinner } from "./spinner";
import { authClient } from "~/lib/auth-client";
import { Button } from "./ui/button";
import { IconBrandGoogle } from "@tabler/icons-react";
import { Logo } from "./logo";

export function LoginDrawerDialog({
  children,
  open,
  onOpenChange,
}: React.PropsWithChildren<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}>) {
  const { mutate: signInWithGoogle, isPending: isSigningIn } = useMutation({
    mutationFn: () =>
      authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      }),
  });

  return (
    <DrawerDialog open={open} onOpenChange={onOpenChange}>
      <DrawerDialogTrigger asChild>{children}</DrawerDialogTrigger>
      <DrawerDialogContent>
        <DrawerDialogHeader className="gap-1">
          <Logo className="mx-auto" />
          <DrawerDialogTitle className="text-center text-2xl">
            Welcome to GearVerse
          </DrawerDialogTitle>
          <DrawerDialogDescription className="text-center">
            Sign in/up to your account
          </DrawerDialogDescription>
        </DrawerDialogHeader>

        <DrawerDialogBody className="flex flex-col items-center gap-3">
          <Button
            onClick={() => signInWithGoogle()}
            disabled={isSigningIn}
            className="w-full"
          >
            {isSigningIn ? <Spinner /> : <IconBrandGoogle />}
            Continue with Google
          </Button>
          <p className="text-muted-foreground text-center text-sm">
            Don&apos;t have an account? No problem—one will be created
            automatically when you sign in for the first time.
          </p>
        </DrawerDialogBody>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
