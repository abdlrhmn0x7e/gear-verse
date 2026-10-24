import { cacheTag } from "next/cache";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import Link from "next/link";
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
  { title: "Request an item", href: "/#request" },
  { title: "FAQ", href: "/#faq" },
  { title: "My orders", href: "/orders" },
  { title: "Returns & refunds", href: "/returns" },
];

// phones get a 44px row per link; the columns keep their spacing on desktop
const linkClassName =
  "text-muted-foreground hover:text-foreground active:text-foreground pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:min-w-11 pointer-coarse:items-center rounded-sm transition-[color] duration-150 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export async function Footer() {
  const settings = await getStoreSettings();
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
            Gear worth the money, in stock in Egypt. If it&apos;s not on the
            shelf, we&apos;ll get it.
          </p>
          <SocialLinks links={settings} />
        </div>

        <nav aria-label="Shop" className="space-y-4">
          <h2 className="text-sm font-medium">Shop</h2>
          <ul className="space-y-3 text-sm pointer-coarse:space-y-0">
            <li>
              <Link href="/products" className={linkClassName}>
                All products
              </Link>
            </li>
            <Suspense>
              <CategoryLinks />
            </Suspense>
          </ul>
        </nav>

        <nav aria-label="Help" className="space-y-4">
          <h2 className="text-sm font-medium">Help</h2>
          <ul className="space-y-3 text-sm pointer-coarse:space-y-0">
            {HELP_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClassName}>
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {whatsappNumber && (
          <section aria-labelledby="footer-contact" className="space-y-4">
            <h2 id="footer-contact" className="text-sm font-medium">
              Contact
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
              <p className="text-muted-foreground">Chat with us on WhatsApp</p>
            </div>
          </section>
        )}

        <PayOnDelivery
          className={cn(
            "border-t pt-8 md:col-span-3",
            whatsappNumber && "lg:col-span-4",
          )}
        />
      </div>

      <p className="text-muted-foreground px-2 pt-6 text-sm">
        ©{" "}
        <Suspense>
          <CurrentYear />
        </Suspense>{" "}
        Gear Verse. All rights reserved.
      </p>
    </footer>
  );
}

async function CategoryLinks() {
  "use cache";

  cacheTag("categories-menu", "sitemap");

  const categories = await app.public.categories.queries.findRoots();

  return categories.map((category) => (
    <li key={category.slug}>
      <Link href={`/categories/${category.slug}`} className={linkClassName}>
        {category.name}
      </Link>
    </li>
  ));
}
