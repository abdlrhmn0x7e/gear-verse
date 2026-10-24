"use client";
import * as Sentry from "@sentry/nextjs";
import { HomeIcon, SkullIcon } from "lucide-react";
import { createTranslator } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Heading } from "~/components/heading";
import { Button } from "~/components/ui/button";
import arErrors from "~/messages/ar/errors.json";
import enErrors from "~/messages/en/errors.json";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  // this replaces the root layout, so no intl provider is above it; the URL still says which language to use
  const ar = useParams<{ locale?: string }>().locale === "ar";
  const t = createTranslator({
    locale: ar ? "ar" : "en",
    messages: { errors: ar ? arErrors : enErrors },
    namespace: "errors.global",
  });

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang={ar ? "ar" : "en"} dir={ar ? "rtl" : "ltr"}>
      <body>
        <div className="flex min-h-svh flex-col items-center justify-center gap-3 pb-12">
          <SkullIcon className="size-24" />
          <Heading level={3}>{t("title")}</Heading>
          <p className="text-muted-foreground">{t("description")}</p>

          <Button
            size="lg"
            nativeButton={false}
            render={<Link href={ar ? "/ar" : "/"} />}
          >
            <HomeIcon />
            {t("home")}
          </Button>
        </div>
      </body>
    </html>
  );
}
