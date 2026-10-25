import { cacheTag } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "~/i18n/navigation";
import { localizedCopyProps } from "~/lib/arabic";
import { cn } from "~/lib/utils";
import { app } from "~/server/application";

const chipClassName =
  "inline-flex shrink-0 items-center rounded-full font-medium whitespace-nowrap transition-[scale,background-color,color] duration-150 ease-out outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-safe:active:scale-[0.96]";

// sub-categories sit one level down, so they get a smaller, borderless chip and only one black chip shows at a time
const chipLevels = {
  primary: {
    size: "h-10 pointer-coarse:h-11 px-5 text-sm",
    active: "surface-selected",
    idle: "surface-control",
  },
  secondary: {
    size: "h-8 pointer-coarse:h-10 px-3.5 text-[13px]",
    active: "bg-tile text-foreground",
    idle: "text-muted-foreground hover:bg-tile hover:text-foreground",
  },
};

/** Category navigation for the store and category pages; `activeSlug` null means "All products". */
export async function CategoryChips({
  activeSlug,
}: {
  activeSlug: string | null;
}) {
  "use cache";

  cacheTag("categories-menu", "sitemap");

  const locale = await getLocale();
  const [categories, t] = await Promise.all([
    app.public.categories.queries.findRoots(locale),
    getTranslations("products.chips"),
  ]);
  const chips = [
    { label: t("allProducts"), href: "/products", active: activeSlug === null },
    ...categories.map((category) => ({
      label: (
        <bdi {...localizedCopyProps(locale, category.fallback.name)}>
          {category.name}
        </bdi>
      ),
      href: `/categories/${category.slug}`,
      active: category.slug === activeSlug,
    })),
  ];

  return <ChipNav label={t("label")} chips={chips} level="primary" />;
}

/** The sub-categories of `parent` that have stock; `activeSlug` undefined means "All {parent}". */
export async function SubCategoryChips({
  parent,
  activeSlug,
}: {
  parent: { name: string; slug: string };
  activeSlug: string | undefined;
}) {
  "use cache";

  cacheTag("categories-menu", "sitemap");

  const locale = await getLocale();
  const [children, t] = await Promise.all([
    app.public.categories.queries.getChildren(parent.slug, locale),
    getTranslations("products.chips"),
  ]);
  if (children.length === 0) return null;

  const chips = [
    {
      // one inline run, or the inline-flex chip trims the space before the name
      label: (
        <span>
          {t.rich("allIn", {
            name: parent.name,
            bdi: (chunks) => <bdi>{chunks}</bdi>,
          })}
        </span>
      ),
      href: `/categories/${parent.slug}`,
      active: activeSlug === undefined,
    },
    ...children.map((child) => ({
      label: (
        <bdi {...localizedCopyProps(locale, child.fallback.name)}>
          {child.name}
        </bdi>
      ),
      href: `/categories/${child.slug}`,
      active: child.slug === activeSlug,
    })),
  ];

  return (
    <ChipNav
      label={t("subLabel", { name: parent.name })}
      chips={chips}
      level="secondary"
    />
  );
}

function ChipNav({
  label,
  chips,
  level,
}: {
  label: string;
  /** each name arrives isolated, marked English or pinned right to left on the Arabic site */
  chips: { label: React.ReactNode; href: string; active: boolean }[];
  level: keyof typeof chipLevels;
}) {
  const styles = chipLevels[level];
  return (
    <nav aria-label={label} className="-mx-6 lg:-mx-8">
      <ul className="no-scrollbar flex snap-x snap-mandatory scroll-px-6 gap-2 overflow-x-auto px-6 py-1 lg:scroll-px-8 lg:px-8">
        {chips.map((chip) => (
          <li key={chip.href} className="snap-start">
            <Link
              href={chip.href}
              aria-current={chip.active ? "page" : undefined}
              className={cn(
                chipClassName,
                styles.size,
                chip.active ? styles.active : styles.idle,
              )}
            >
              {chip.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
