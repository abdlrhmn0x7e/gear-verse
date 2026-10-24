import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import * as rootParams from "next/root-params";
import { loadMessages } from "./messages";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale: override }) => {
  const requested = override ?? (await rootParams.locale());
  // undefined outside [locale] (the admin, the global 404), which are English. An unknown first segment such as
  // /missing.txt renders in English too, and the storefront layout turns it into a 404: a notFound() here would throw
  // out of the root layout, past every not-found boundary.
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
    timeZone: "Africa/Cairo",
  };
});
