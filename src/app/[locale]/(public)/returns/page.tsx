import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { WhatsAppNumberLink } from "~/components/whatsapp-number-link";
import { getStoreSettings } from "~/lib/store-settings";
import { pageMetadata } from "~/lib/seo/metadata";

// the root title template adds " | Gear Verse"
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("returns.metadata");
  const title = t("title");

  return {
    title,
    ...(await pageMetadata({
      title,
      description: t("description"),
      path: "/returns",
    })),
  };
}

export default async function ReturnsPage() {
  const [{ whatsappNumber }, t, tWhatsApp] = await Promise.all([
    getStoreSettings(),
    getTranslations("returns"),
    getTranslations("common.whatsapp"),
  ]);

  return (
    <MaxWidthWrapper className="pt-28 pb-12 md:pt-36">
      <header className="max-w-2xl">
        <h1 className="text-headline-sm md:text-display-sm text-balance">
          {t("metadata.title")}
        </h1>
      </header>

      <article className="typeset mt-8 max-w-2xl md:mt-10">
        <h2>{t("accept.heading")}</h2>
        <p>{t("accept.body")}</p>
        <p>{t("accept.qualify")}</p>
        <ul>
          <li>{t("accept.report")}</li>
          <li>{t("accept.evidence")}</li>
          <li>{t("accept.inspect")}</li>
        </ul>

        <h2>{t("approved.heading")}</h2>
        <ul>
          <li>{t("approved.collect")}</li>
          <li>{t("approved.refund")}</li>
        </ul>

        <h2>{t("declined.heading")}</h2>
        <p>{t("declined.intro")}</p>
        <ul>
          <li>{t("declined.noDefect")}</li>
          <li>{t("declined.misuse")}</li>
          <li>{t("declined.late")}</li>
        </ul>

        <h2>{t("note.heading")}</h2>
        <p>{t("note.body")}</p>

        {whatsappNumber && (
          <>
            <h2>{t("report.heading")}</h2>
            <p>
              {t.rich("report.body", {
                number: () => (
                  <WhatsAppNumberLink
                    number={whatsappNumber}
                    message={tWhatsApp("reportIssue")}
                    className="tabular-nums"
                  />
                ),
              })}
            </p>
          </>
        )}
      </article>
    </MaxWidthWrapper>
  );
}
