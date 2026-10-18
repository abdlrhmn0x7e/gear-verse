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
import { GoogleLogo } from "./google-logo";
import { Logo } from "./logo";
import { invalidateCache } from "~/server/actions/cache";

export function LoginDrawerDialog({
  children,
  open,
  onOpenChange,
}: React.PropsWithChildren<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}>) {
  const { mutate: signInWithGoogle, isPending: isSigningIn } = useMutation({
    mutationFn: async () => {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
      void invalidateCache("customer-summary");
    },
    onSuccess: () => {
      onOpenChange?.(false);
    },
  });

  return (
    <DrawerDialog open={open} onOpenChange={onOpenChange}>
      <DrawerDialogTrigger asChild>{children}</DrawerDialogTrigger>
      <DrawerDialogContent>
        <DrawerDialogHeader className="gap-1">
          <Logo className="mx-auto mb-2 h-16" />
          <DrawerDialogTitle className="text-center text-2xl">
            Welcome to GearVerse
          </DrawerDialogTitle>
          <DrawerDialogDescription className="text-center">
            Sign in/up to your account
          </DrawerDialogDescription>
        </DrawerDialogHeader>

        <DrawerDialogBody className="flex flex-col items-center gap-3">
          {/* Google's sign-in branding: neutral fill, grey hairline and the full-colour G, never the brand colour */}
          <Button
            variant="ghost"
            size="lg"
            onClick={() => signInWithGoogle()}
            disabled={isSigningIn}
            className="w-full border-[#747775] bg-white text-[#1F1F1F] hover:bg-[#EEEEEE] dark:border-[#8E918F] dark:bg-[#131314] dark:text-[#E3E3E3] dark:hover:bg-[#242425]"
          >
            {isSigningIn ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <GoogleLogo data-icon="inline-start" className="size-[18px]" />
            )}
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
