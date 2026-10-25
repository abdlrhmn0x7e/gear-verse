import { useLocale, useTranslations } from "next-intl";

type ClientError = {
  message: string;
  data?: { code?: string; zodError?: unknown } | null;
};

/** bad requests carry a message meant for the customer (e.g. stock), anything else gets the fallback */
export function getCustomerErrorMessage(error: ClientError, fallback: string) {
  return error.data?.code === "BAD_REQUEST" && !error.data.zodError
    ? error.message
    : fallback;
}

/**
 * The server writes its customer messages in English (carts data access, the checkout router). Each one it can send
 * from the cart and checkout matches a key in cart.serverErrors, so a change to the wording there must change the
 * pattern here too; until it does, Arabic shows the fallback.
 */
const SERVER_ERRORS = [
  [/^This product is no longer available$/, "productUnavailable"],
  [/^This product is out of stock$/, "productOutOfStock"],
  [
    /^Only (?<stock>\d+) left in stock, and your cart already has them all$/,
    "cartHasAll",
  ],
  [/^Please choose one of your saved addresses$/, "chooseSavedAddress"],
  [/^Cart is empty$/, "cartEmpty"],
  [
    /^(?<title>.+) is no longer available, please remove it from your cart$/,
    "itemUnavailable",
  ],
  [
    /^Insufficient stock for (?<title>.+): only (?<stock>\d+) left$/,
    "itemShort",
  ],
  [/^Insufficient stock for (?<title>.+): it is out of stock$/, "itemOut"],
] as const;

/** getCustomerErrorMessage in the visitor's language: English passes through, other locales translate what they know */
export function useCustomerErrorMessage() {
  const locale = useLocale();
  const t = useTranslations("cart.serverErrors");

  return (error: ClientError, fallback: string) => {
    const message = getCustomerErrorMessage(error, fallback);
    if (locale === "en" || message === fallback) return message;

    for (const [pattern, key] of SERVER_ERRORS) {
      const match = pattern.exec(message);
      if (!match) continue;
      const { groups } = match;
      return t(key, {
        stock: groups?.stock ?? "",
        // a toast is plain text, so the isolate marks keep a Latin product name from flipping the Arabic around it
        title: `⁨${groups?.title ?? ""}⁩`,
      });
    }
    return fallback;
  };
}
