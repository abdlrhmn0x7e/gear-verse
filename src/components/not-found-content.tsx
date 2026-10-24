import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "~/i18n/navigation";
import { Button } from "~/components/ui/button";

export function NotFoundContent() {
  const t = useTranslations("errors.notFound");

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 pb-12 text-center">
      <p className="text-muted-foreground text-sm font-medium tabular-nums">
        404
      </p>
      <h1 className="text-headline-sm md:text-headline text-balance">
        {t("title")}
      </h1>
      <p className="text-muted-foreground text-body-lg max-w-md text-pretty">
        {t("description")}
      </p>
      <Button
        size="lg"
        className="mt-2"
        nativeButton={false}
        render={<Link href="/products" />}
      >
        {t("browse")}
        <ArrowRightIcon data-icon="inline-end" className="rtl:-scale-x-100" />
      </Button>
    </div>
  );
}
