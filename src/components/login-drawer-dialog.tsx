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
import { useLocale, useTranslations } from "next-intl";
import { getPathname } from "~/i18n/navigation";
import { Spinner } from "./spinner";
import { authClient } from "~/lib/auth-client";
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
  const t = useTranslations("auth");

  return (
    <DrawerDialog open={open} onOpenChange={onOpenChange}>
      <DrawerDialogTrigger render={children} />
      <DrawerDialogContent>
        <DrawerDialogHeader className="gap-1">
          <Logo className="mx-auto mb-2 h-16" />
          <DrawerDialogTitle className="text-center text-2xl">
            {t("welcome")}
          </DrawerDialogTitle>
          <DrawerDialogDescription className="text-center">
            {t("welcomeDescription")}
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
            {t("newHere")}
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
  const locale = useLocale();
  const t = useTranslations("auth");
  const { mutate: signInWithGoogle, isPending: isSigningIn } = useMutation({
    mutationFn: async () => {
      await authClient.signIn.social({
        provider: "google",
        // back to the page in the language the visitor signed in from
        callbackURL: getPathname({ href: callbackURL, locale }),
      });
    },
    onSuccess,
  });

  return (
    // the site's own outline button carrying Google's full-colour G, never the brand colour
    <Button
      variant="outline"
      size={size}
      onClick={() => signInWithGoogle()}
      disabled={isSigningIn}
      className={className}
    >
      {isSigningIn ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <GoogleLogo data-icon="inline-start" className="size-[18px]" />
      )}
      {t("continueWithGoogle")}
    </Button>
  );
}
