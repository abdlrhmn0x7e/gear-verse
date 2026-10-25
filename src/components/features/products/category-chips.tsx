import { cacheTag } from "next/cache";
import { Link } from "~/i18n/navigation";
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

  const categories = await app.public.categories.queries.findRoots();
  const chips = [
    { label: "All products", href: "/products", active: activeSlug === null },
    ...categories.map((category) => ({
      label: category.name,
      href: `/categories/${category.slug}`,
      active: category.slug === activeSlug,
    })),
  ];

  return <ChipNav label="Categories" chips={chips} level="primary" />;
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

  const children = await app.public.categories.queries.getChildren(parent.slug);
  if (children.length === 0) return null;

  const chips = [
    {
      label: `All ${parent.name}`,
      href: `/categories/${parent.slug}`,
      active: activeSlug === undefined,
    },
    ...children.map((child) => ({
      label: child.name,
      href: `/categories/${child.slug}`,
      active: child.slug === activeSlug,
    })),
  ];

  return (
    <ChipNav
      label={`${parent.name} categories`}
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
  chips: { label: string; href: string; active: boolean }[];
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
