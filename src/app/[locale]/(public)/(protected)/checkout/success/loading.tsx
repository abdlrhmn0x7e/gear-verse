import { useTranslations } from "next-intl";
import { Spinner } from "~/components/spinner";

export default function SuccessLoading() {
  const t = useTranslations("checkout.success");

  return (
    <div
      className="text-muted-foreground flex h-full w-full items-center justify-center gap-2 py-24 text-sm"
      role="status"
    >
      <Spinner size="small" aria-hidden />
      {t("loading")}
    </div>
  );
}
