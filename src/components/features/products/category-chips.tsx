import { cacheTag } from "next/cache";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { app } from "~/server/application";

const chipClassName =
  "inline-flex h-10 shrink-0 pointer-coarse:h-11 items-center rounded-full px-5 text-sm font-medium whitespace-nowrap transition-[scale,background-color] duration-150 ease-out outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-safe:active:scale-[0.96]";

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

  return <ChipNav label="Categories" chips={chips} />;
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

  return <ChipNav label={`${parent.name} categories`} chips={chips} />;
}

function ChipNav({
  label,
  chips,
}: {
  label: string;
  chips: { label: string; href: string; active: boolean }[];
}) {
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
                chip.active ? "surface-selected" : "surface-control",
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
