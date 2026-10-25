import { IconArrowRight, IconFolder } from "@tabler/icons-react";
import { cacheTag } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";
import { localizedCopyProps } from "~/lib/arabic";
import { iconsMap } from "~/lib/icons-map";
import { app } from "~/server/application";
import { NavLink } from "./nav";

export async function CategoriesMenu() {
  "use cache";

  cacheTag("categories-menu", "sitemap");

  const locale = await getLocale();
  const [categories, t] = await Promise.all([
    app.public.categories.queries.findRoots(locale),
    getTranslations("nav"),
  ]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {categories.map((category) => {
        const Icon = iconsMap.get(category.icon) ?? IconFolder;
        return (
          <NavLink
            key={category.id}
            href={`/categories/${category.slug}`}
            className="bg-tile hover:bg-tile-hover group focus-visible:outline-focus flex flex-col gap-6 rounded-2xl p-4 transition-[background-color] duration-150 outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Icon className="size-5" stroke={1.75} aria-hidden />
            {/* isolated, so a name still in English keeps its punctuation in place in Arabic */}
            <span className="text-sm font-medium">
              <bdi {...localizedCopyProps(locale, category.fallback.name)}>
                {category.name}
              </bdi>
            </span>
          </NavLink>
        );
      })}

      <NavLink
        href="/products"
        className="hover:bg-accent focus-visible:outline-focus flex flex-col justify-between gap-6 rounded-2xl border p-4 transition-[background-color] duration-150 outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <IconArrowRight
          className="size-5 rtl:-scale-x-100"
          stroke={1.75}
          aria-hidden
        />
        <span className="text-sm font-medium">{t("shopEverything")}</span>
      </NavLink>
    </div>
  );
}
