"use client";

import { CloudIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { GoogleLogo } from "~/components/google-logo";
import { LoginDrawerDialog } from "~/components/login-drawer-dialog";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

/**
 * Guests shop on an anonymous session, so their orders live in this browser
 * only. Signing in with Google moves them onto the account (the anonymous
 * plugin's onLinkAccount), and Google sends them back to `callbackURL`.
 */
export function SaveOrdersPrompt({
  callbackURL,
  className,
}: {
  callbackURL: string;
  className?: string;
}) {
  const t = useTranslations("auth");

  return (
    <section
      aria-labelledby="save-orders-title"
      className={cn(
        "bg-card flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6",
        className,
      )}
    >
      <div className="flex gap-3">
        <CloudIcon
          className="text-muted-foreground mt-0.5 size-5 shrink-0"
          strokeWidth={1.5}
          aria-hidden
        />
        <div className="min-w-0">
          <h2 id="save-orders-title" className="font-medium">
            {t("saveOrders.title")}
          </h2>
          <p className="text-muted-foreground text-sm text-pretty">
            {t("saveOrders.description")}
          </p>
        </div>
      </div>

      <LoginDrawerDialog callbackURL={callbackURL}>
        <Button variant="outline" size="lg" className="shrink-0">
          <GoogleLogo data-icon="inline-start" className="size-[18px]" />
          {t("continueWithGoogle")}
        </Button>
      </LoginDrawerDialog>
    </section>
  );
}
