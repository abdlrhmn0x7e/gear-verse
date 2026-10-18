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
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import { GoogleLogo } from "./google-logo";
import { Logo } from "./logo";

export function LoginDrawerDialog({
  children,
  open,
  onOpenChange,
  callbackURL = "/",
}: {
  children: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** where Google sends the visitor back to once they're signed in */
  callbackURL?: string;
}) {
  return (
    <DrawerDialog open={open} onOpenChange={onOpenChange}>
      <DrawerDialogTrigger render={children} />
      <DrawerDialogContent>
        <DrawerDialogHeader className="gap-1">
          <Logo className="mx-auto mb-2 h-16" />
          <DrawerDialogTitle className="text-center text-2xl">
            Welcome to Gear Verse
          </DrawerDialogTitle>
          <DrawerDialogDescription className="text-center">
            Sign in or create an account
          </DrawerDialogDescription>
        </DrawerDialogHeader>

        <DrawerDialogBody className="flex flex-col items-center gap-3">
          <GoogleSignInButton
            size="lg"
            className="w-full"
            callbackURL={callbackURL}
            onSuccess={() => onOpenChange?.(false)}
          />
          <p className="text-muted-foreground text-center text-sm">
            New here? Your account is created the first time you sign in.
          </p>
        </DrawerDialogBody>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}

export function GoogleSignInButton({
  size,
  className,
  callbackURL = "/",
  onSuccess,
}: {
  size: "lg" | "xl";
  className?: string;
  /** where Google sends the visitor back to once they're signed in */
  callbackURL?: string;
  onSuccess?: () => void;
}) {
  const { mutate: signInWithGoogle, isPending: isSigningIn } = useMutation({
    mutationFn: async () => {
      await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });
    },
    onSuccess,
  });

  return (
    // Google's sign-in branding: neutral fill, grey hairline and the full-colour G, never the brand colour
    <Button
      variant="ghost"
      size={size}
      onClick={() => signInWithGoogle()}
      disabled={isSigningIn}
      className={cn(
        "border-[#747775] bg-white text-[#1F1F1F] hover:bg-[#EEEEEE] dark:border-[#8E918F] dark:bg-[#131314] dark:text-[#E3E3E3] dark:hover:bg-[#242425]",
        className,
      )}
    >
      {isSigningIn ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <GoogleLogo data-icon="inline-start" className="size-[18px]" />
      )}
      Continue with Google
    </Button>
  );
}
