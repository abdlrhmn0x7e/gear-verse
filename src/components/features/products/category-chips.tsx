import { cacheTag } from "next/cache";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { app } from "~/server/application";

const chipClassName =
  "inline-flex h-10 shrink-0 items-center rounded-full px-5 text-sm font-medium whitespace-nowrap transition-[scale,background-color] duration-150 ease-out outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-safe:active:scale-[0.96]";

/** Category navigation for the store and category pages; `activeSlug` null means "All products". */
export async function CategoryChips({
  activeSlug,
}: {
  activeSlug: string | null;
}) {
  "use cache";

  cacheTag("categories-menu");

  const categories = await app.public.categories.queries.findRoots();
  const chips = [
    { label: "All products", href: "/products", active: activeSlug === null },
    ...categories.map((category) => ({
      label: category.name,
      href: `/categories/${category.slug}`,
      active: category.slug === activeSlug,
    })),
  ];

  return (
    <nav aria-label="Categories" className="-mx-6 lg:-mx-8">
      <ul className="no-scrollbar flex gap-2 overflow-x-auto px-6 py-1 lg:px-8">
        {chips.map((chip) => (
          <li key={chip.href}>
            <Link
              href={chip.href}
              aria-current={chip.active ? "page" : undefined}
              className={cn(
                chipClassName,
                chip.active ? "surface-solid" : "surface-control",
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
