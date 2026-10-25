import auth from "~/messages/en/auth.json";
import cart from "~/messages/en/cart.json";
import checkout from "~/messages/en/checkout.json";
import common from "~/messages/en/common.json";
import errors from "~/messages/en/errors.json";
import footer from "~/messages/en/footer.json";
import landing from "~/messages/en/landing.json";
import nav from "~/messages/en/nav.json";
import orders from "~/messages/en/orders.json";
import products from "~/messages/en/products.json";
import returns from "~/messages/en/returns.json";
import type { Locale } from "./routing";

/**
 * One file per namespace per locale, so translators of different namespaces never edit the same file. English is the
 * source of the key types; `bun run check:messages` keeps every other locale's keys identical to it.
 */
const en = {
  auth,
  cart,
  checkout,
  common,
  errors,
  footer,
  landing,
  nav,
  orders,
  products,
  returns,
};

export type Messages = typeof en;

export async function loadMessages(locale: Locale): Promise<Messages> {
  if (locale === "en") return en;

  const namespaces = Object.keys(en) as (keyof Messages)[];
  const files = await Promise.all(
    namespaces.map(
      (namespace) =>
        import(`../messages/${locale}/${namespace}.json`) as Promise<{
          default: unknown;
        }>,
    ),
  );
  return Object.fromEntries(
    namespaces.map((namespace, index) => [namespace, files[index]!.default]),
  ) as Messages;
}
