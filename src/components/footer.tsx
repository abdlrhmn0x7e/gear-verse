import { cacheTag } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { app } from "~/server/application";
import { CurrentYear } from "./current-year";
import { Logo } from "./logo";
import { SOCIAL_LINKS } from "./navbar/social-links";
import { Button } from "./ui/button";

const HELP_LINKS = [
  { title: "FAQ", href: "/#faq" },
  { title: "My orders", href: "/orders" },
];

const linkClassName =
  "text-muted-foreground hover:text-foreground rounded-sm transition-[color] duration-150 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export function Footer() {
  return (
    <footer className="mx-auto w-full max-w-7xl px-4 pt-24 pb-8 md:px-6 lg:px-8">
      <div className="bg-card grid gap-12 rounded-3xl p-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] md:p-12">
        <div className="flex flex-col items-start gap-6">
          <Link
            href="/"
            className="rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            <Logo className="h-11" />
          </Link>
          <p className="text-muted-foreground max-w-xs text-pretty">
            The world&apos;s best gear, hand-imported to Egypt. Customs
            cleared, insured and delivered.
          </p>
          <ul className="flex gap-2">
            {SOCIAL_LINKS.map((link) => (
              <li key={link.url}>
                <Button variant="outline" size="icon-lg" asChild>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <link.icon stroke={1.75} />
                    <span className="sr-only">{link.label}</span>
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Shop" className="space-y-4">
          <h2 className="text-sm font-medium">Shop</h2>
          <ul className="space-y-3 text-sm">
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
          <ul className="space-y-3 text-sm">
            {HELP_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClassName}>
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
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

  cacheTag("categories-menu");

  const categories = await app.public.categories.queries.findRoots();

  return categories.map((category) => (
    <li key={category.slug}>
      <Link href={`/categories/${category.slug}`} className={linkClassName}>
        {category.name}
      </Link>
    </li>
  ));
}
