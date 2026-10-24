import { getTranslations } from "next-intl/server";
import { Link } from "~/i18n/navigation";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { WhatsAppNumberLink } from "~/components/whatsapp-number-link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { getStoreSettings } from "~/lib/store-settings";

const inlineLinkClassName =
  "text-foreground underline decoration-from-font underline-offset-4";

/** In order; each has a question and an answer under `landing.faq.items`. */
const FAQ_ITEMS = [
  "about",
  "request",
  "delivery",
  "payment",
  "returns",
  "tracking",
  "authentic",
  "deliveryTime",
  "damaged",
] as const;

export async function FAQ() {
  const [{ discordUrl, whatsappNumber }, t, tWhatsApp] = await Promise.all([
    getStoreSettings(),
    getTranslations("landing.faq"),
    getTranslations("common.whatsapp"),
  ]);

  const numberLink = (message: string) =>
    whatsappNumber && (
      <WhatsAppNumberLink
        number={whatsappNumber}
        message={message}
        className={`${inlineLinkClassName} tabular-nums`}
      />
    );

  /** " on WhatsApp at +20 …", where a policy answer says to report a problem */
  const onWhatsApp = whatsappNumber && (
    <>
      {" "}
      {t.rich("onWhatsApp", {
        number: () => numberLink(tWhatsApp("reportIssue")),
      })}
    </>
  );
  const answerTags = {
    request: (chunks: React.ReactNode) => (
      <a href="#request" className={inlineLinkClassName}>
        {chunks}
      </a>
    ),
    policy: (chunks: React.ReactNode) => (
      <Link href="/returns" className={inlineLinkClassName}>
        {chunks}
      </Link>
    ),
    whatsapp: () => onWhatsApp,
  };

  return (
    <section id="faq" className="py-12 md:py-16" aria-labelledby="faq-heading">
      <MaxWidthWrapper className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-16">
        <div className="space-y-4">
          <h2
            id="faq-heading"
            className="text-headline-sm md:text-headline text-balance"
          >
            {t("title")}
          </h2>
          {/* WhatsApp is the main channel; Discord stands in only until a number is set */}
          {whatsappNumber ? (
            <p className="text-muted-foreground text-body-lg max-w-sm text-pretty">
              {t.rich("askWhatsApp", {
                number: () => numberLink(tWhatsApp("question")),
              })}
            </p>
          ) : (
            discordUrl && (
              <p className="text-muted-foreground text-body-lg max-w-sm text-pretty">
                {t.rich("askDiscord", {
                  discord: (chunks) => (
                    <a
                      href={discordUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={inlineLinkClassName}
                    >
                      {chunks}
                    </a>
                  ),
                })}
              </p>
            )
          )}
        </div>

        <Accordion defaultValue={["item-1"]}>
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem key={item} value={`item-${index + 1}`}>
              <AccordionTrigger>{t(`items.${item}.question`)}</AccordionTrigger>
              <AccordionContent>
                <p>{t.rich(`items.${item}.answer`, answerTags)}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </MaxWidthWrapper>
    </section>
  );
}
