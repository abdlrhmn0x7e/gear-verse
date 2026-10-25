import { useTranslations } from "next-intl";
import { WhatsAppNumberLink } from "~/components/whatsapp-number-link";

export function OrdersHeading({
  whatsappNumber,
}: {
  whatsappNumber: string | null;
}) {
  const t = useTranslations("orders");
  const tWhatsApp = useTranslations("common.whatsapp");

  return (
    <header className="space-y-2">
      <h1 className="text-headline-sm md:text-display-sm text-balance">
        {t("title")}
      </h1>
      <p className="text-muted-foreground text-pretty">
        {t("description")}
        {whatsappNumber && (
          <>
            {" "}
            {t.rich("questions", {
              number: () => (
                <WhatsAppNumberLink
                  number={whatsappNumber}
                  message={tWhatsApp("orderQuestion")}
                  className="text-foreground font-medium tabular-nums underline decoration-from-font underline-offset-4"
                />
              ),
            })}
          </>
        )}
      </p>
    </header>
  );
}
