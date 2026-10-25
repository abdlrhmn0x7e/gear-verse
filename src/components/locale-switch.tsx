"use client";

import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Link, usePathname } from "~/i18n/navigation";
import { routing, type Locale } from "~/i18n/routing";

/** Each language by its own name, so someone who can't read the current page still finds theirs. */
const LOCALE_NAMES = {
  en: "English",
  ar: "العربية",
} satisfies Record<Locale, string>;

type LocaleLinkProps = Omit<
  React.ComponentProps<typeof Link>,
  "href" | "locale" | "children"
> & {
  /** the other language's name, in that language; a menu row wraps it in its icon and chevron */
  children?: (name: React.ReactNode) => React.ReactNode;
};

/**
 * The same page in the other language. Picking it stores the choice in the locale cookie, so later visits to an
 * unprefixed URL land on the Arabic twin.
 */
export function LocaleLink(props: LocaleLinkProps) {
  // the query is only known in the browser, so the prerendered link carries the path alone
  return (
    <Suspense fallback={<LocaleLinkWithQuery {...props} query="" />}>
      <LocaleLinkWithSearchParams {...props} />
    </Suspense>
  );
}

function LocaleLinkWithSearchParams(props: LocaleLinkProps) {
  return (
    <LocaleLinkWithQuery {...props} query={useSearchParams().toString()} />
  );
}

function LocaleLinkWithQuery({
  query,
  children = (name) => name,
  ...props
}: LocaleLinkProps & { query: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const target = routing.locales.find((other) => other !== locale)!;
  const name = <bdi lang={target}>{LOCALE_NAMES[target]}</bdi>;

  return (
    <Link
      href={query ? `${pathname}?${query}` : pathname}
      locale={target}
      {...props}
    >
      {children(name)}
    </Link>
  );
}
