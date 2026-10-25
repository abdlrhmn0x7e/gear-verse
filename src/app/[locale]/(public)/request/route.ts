import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { NextRequest } from "next/server";
import { routing } from "~/i18n/routing";
import { localizedPath } from "~/lib/seo/metadata";
import { getStoreSettings } from "~/lib/store-settings";
import { requestedItem, whatsAppLink } from "~/lib/whatsapp";

/**
 * Every "Request an item" entry point links here, with what the customer typed or searched for in `?item=`,
 * and lands in a WhatsApp chat with the request already written. One URL keeps the store's number out of
 * client code and leaves a single place to count requests later. Until a number is set, the FAQ's contact
 * line is the closest way to reach the team.
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/[locale]/request">,
) {
  const [{ whatsappNumber }, { locale: requested }] = await Promise.all([
    getStoreSettings(),
    params,
  ]);
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  if (!whatsappNumber) {
    const home = localizedPath("/", locale);
    return Response.redirect(new URL(`${home}#faq`, request.url), 307);
  }

  // the chat opens in the visitor's language
  const t = await getTranslations({ locale, namespace: "common.whatsapp" });
  const item = requestedItem(request.nextUrl.searchParams.get("item"));
  return Response.redirect(
    whatsAppLink(
      whatsappNumber,
      item ? t("requestItem", { item }) : t("requestAnything"),
    ),
    307,
  );
}
