import { cacheTag } from "next/cache";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { getLocale, getTranslations } from "next-intl/server";
import { localizedCopyProps } from "~/lib/arabic";
import { Link } from "~/i18n/navigation";
import { Suspense } from "react";
import { getStoreSettings } from "~/lib/store-settings";
import { cn } from "~/lib/utils";
import { app } from "~/server/application";
import { CurrentYear } from "./current-year";
import { PayOnDelivery } from "./features/payment/pay-on-delivery";
import { Logo } from "./logo";
import { SocialLinks } from "./social-links";
import { WhatsAppNumberLink } from "./whatsapp-number-link";

const HELP_LINKS = [
  { key: "requestItem", href: "/#request" },
  { key: "faq", href: "/#faq" },
  { key: "myOrders", href: "/orders" },
  { key: "returns", href: "/returns" },
] as const;

// phones get a 44px row per link; the columns keep their spacing on desktop
const linkClassName =
  "text-muted-foreground hover:text-foreground active:text-foreground pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:min-w-11 pointer-coarse:items-center rounded-sm transition-[color] duration-150 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export async function Footer() {
  const [settings, t] = await Promise.all([
    getStoreSettings(),
    getTranslations("footer"),
  ]);
  const { whatsappNumber } = settings;

  return (
    <footer className="mx-auto w-full max-w-7xl px-4 pt-16 pb-8 md:px-6 lg:px-8">
      {/* with a Contact column, tablets give the brand its own row so the three link columns have room for the number */}
      <div
        className={cn(
          "dark contrast-tile grid gap-12 rounded-3xl p-8 md:p-12",
          whatsappNumber
            ? "md:grid-cols-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]"
            : "md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]",
        )}
      >
        <div
          className={cn(
            "flex flex-col items-start gap-6",
            whatsappNumber && "md:col-span-3 lg:col-span-1",
          )}
        >
          <Link
            href="/"
            className="focus-visible:outline-focus rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <Logo className="h-14" />
          </Link>
          <p className="text-muted-foreground max-w-xs text-pretty">
            {t("tagline")}
          </p>
          <SocialLinks links={settings} />
        </div>

        <nav aria-label={t("shop")} className="space-y-4">
          <h2 className="text-sm font-medium">{t("shop")}</h2>
          <ul className="space-y-3 text-sm pointer-coarse:space-y-0">
            <li>
              <Link href="/products" className={linkClassName}>
                {t("allProducts")}
              </Link>
            </li>
            <Suspense>
              <CategoryLinks />
            </Suspense>
          </ul>
        </nav>

        <nav aria-label={t("help")} className="space-y-4">
          <h2 className="text-sm font-medium">{t("help")}</h2>
          <ul className="space-y-3 text-sm pointer-coarse:space-y-0">
            {HELP_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClassName}>
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {whatsappNumber && (
          <section aria-labelledby="footer-contact" className="space-y-4">
            <h2 id="footer-contact" className="text-sm font-medium">
              {t("contact")}
            </h2>
            <div className="space-y-1.5 text-sm">
              <WhatsAppNumberLink
                number={whatsappNumber}
                className="text-foreground hover:text-primary inline-flex items-center gap-2 font-medium tabular-nums transition-[color] duration-150"
              >
                <IconBrandWhatsapp
                  className="size-5 shrink-0"
                  stroke={1.75}
                  aria-hidden
                />
              </WhatsAppNumberLink>
              <p className="text-muted-foreground">{t("chatOnWhatsApp")}</p>
            </div>
          </section>
        )}

        <PayOnDelivery
          label={t("waysToPay")}
          note={t("paymentNote")}
          className={cn(
            "border-t pt-8 md:col-span-3",
            whatsappNumber && "lg:col-span-4",
          )}
        />
      </div>

      <p className="text-muted-foreground px-2 pt-6 text-sm">
        {/* the year and the Latin brand name are isolated, or an Arabic line would order them left to right */}
        {t.rich("copyright", {
          year: () => (
            <bdi>
              <Suspense>
                <CurrentYear />
              </Suspense>
            </bdi>
          ),
          brand: (chunks) => <bdi>{chunks}</bdi>,
        })}
      </p>
    </footer>
  );
}

async function CategoryLinks() {
  "use cache";

  cacheTag("categories-menu", "sitemap");

  const locale = await getLocale();
  const categories = await app.public.categories.queries.findRoots(locale);

  return categories.map((category) => (
    <li key={category.slug}>
      <Link href={`/categories/${category.slug}`} className={linkClassName}>
        <bdi {...localizedCopyProps(locale, category.fallback.name)}>
          {category.name}
        </bdi>
      </Link>
    </li>
  ));
}
