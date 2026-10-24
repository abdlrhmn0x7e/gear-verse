import { ChevronDownIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "~/i18n/navigation";
import { NavigationMenu } from "@base-ui/react/navigation-menu";
import { cacheTag } from "next/cache";
import { Suspense } from "react";
import { Logo } from "~/components/logo";
import {
  ProductSearchDialog,
  ProductSearchIcon,
  ProductSearchPlaceholder,
} from "~/components/product-search-dialog";
import { SearchDrawer } from "~/components/search-drawer";
import { ThemeToggle } from "~/components/theme-toggle";
import { Kbd } from "~/components/ui/kbd";
import { LocaleLink } from "~/components/locale-switch";
import { getStoreSettings } from "~/lib/store-settings";
import { cn } from "~/lib/utils";
import { app } from "~/server/application";
import { CartDrawer } from "../cart-drawer";
import { ProfileDropdown } from "../profile-dropdown";
import { pickSocialLinks } from "../social-links";
import { AdminNav } from "./admin-nav";
import { CategoriesMenu } from "./categories-menu";
import { MobileNav } from "./mobile-nav";
import { NavContent, NavTextLink, NavTextTrigger, NavViewport } from "./nav";
import { navTextClassName } from "./nav-text";

export function Navbar() {
  const t = useTranslations("nav");

  return (
    <NavigationMenu.Root delay={100} className="group/nav contents">
      {/* the blur and tint live on a layer that runs 4rem past the bar and eases out (a smoothstep) from just under the links to its
          end, so the bar has no bottom edge and no band where it meets a dark panel; the links' row stays fully tinted, keeping
          muted links at 5.02:1 over the plum panel. An open menu (the nav root's data-open) or the open search turns the same
          layer into the opaque popover surface, and the fade starts in the menu's bottom padding */}
      <header className="group/header before:bg-background/96 supports-backdrop-filter:before:bg-background/94 group-data-[open]/nav:before:bg-popover has-data-[state=open]:before:bg-popover fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:-bottom-16 before:-z-10 before:[mask-image:linear-gradient(to_bottom,#000_calc(100%_-_5rem),rgb(0_0_0/.94)_calc(100%_-_4.25rem),rgb(0_0_0/.78)_calc(100%_-_3.5rem),rgb(0_0_0/.57)_calc(100%_-_2.75rem),rgb(0_0_0/.35)_calc(100%_-_2rem),rgb(0_0_0/.16)_calc(100%_-_1.25rem),rgb(0_0_0/.03)_calc(100%_-_0.5rem),transparent)] before:backdrop-blur-xl before:backdrop-saturate-150 before:transition-[background-color] before:duration-200">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4 md:px-6 lg:px-8">
          <Link
            href="/"
            className="focus-visible:outline-focus shrink-0 rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <Logo className="h-10 translate-y-0.5" />
          </Link>

          <NavigationMenu.List className="hidden items-center md:flex">
            <NavigationMenu.Item>
              <NavTextLink href="/products">{t("store")}</NavTextLink>
            </NavigationMenu.Item>

            <NavigationMenu.Item value="categories">
              <NavTextTrigger>
                {t("categories")}
                <ChevronDownIcon
                  className="size-3.5 transition-[rotate] duration-200 ease-out group-data-popup-open:rotate-180"
                  aria-hidden
                />
              </NavTextTrigger>
              <NavContent>
                <CategoriesMenu />
              </NavContent>
            </NavigationMenu.Item>

            <NavigationMenu.Item>
              <NavTextLink href="/#faq">{t("faq")}</NavTextLink>
            </NavigationMenu.Item>
          </NavigationMenu.List>

          {/* icon buttons are 40px boxes around a 16px glyph, so they sit flush and the outlined shapes (search pill, sign-in pill or
              avatar) take a 12px margin: every visible gap comes out at 24px. Cart stays last, beside where its drawer slides in;
              the -me-3 puts the last glyph on the content edge, as the logo is on the other side. */}
          <div className="ms-auto -me-3 flex items-center">
            <div className="me-3 hidden lg:block">
              <ProductSearchDialog withOverlay={false}>
                <span className="relative z-10 flex h-9 w-60 items-center gap-2 ps-4 pe-14">
                  <ProductSearchIcon className="text-muted-foreground size-4" />
                  <ProductSearchPlaceholder className="text-sm">
                    {t("searchProducts")}
                  </ProductSearchPlaceholder>
                </span>
                {/* the button names its shortcut with aria-keyshortcuts, so its name stays "Search products" */}
                <Kbd
                  aria-hidden
                  className="absolute end-2 top-1/2 z-10 -translate-y-1/2"
                >
                  Ctrl K
                </Kbd>
              </ProductSearchDialog>
            </div>

            <Suspense>
              <SearchDrawer />
            </Suspense>

            <Suspense fallback={null}>
              <AdminNav />
            </Suspense>

            {/* phones switch language and theme from the menu drawer, keeping the bar to search, cart and menu */}
            <LocaleLink
              className={cn(navTextClassName, "hidden md:inline-flex")}
            />
            <ThemeToggle className="hidden md:inline-flex" />

            <ProfileDropdown className="mx-3 hidden md:inline-flex" />

            <Suspense>
              <CartDrawer />
            </Suspense>

            <Suspense>
              <StoreMobileNav />
            </Suspense>
          </div>
        </div>

        <NavViewport />

        {/* Safari 26 paints the strip above the page (under the status bar, or the toolbar on a Mac) in the colour of
            a fixed bar at the top edge. It takes that colour from the background-color of the element at the edge
            and its ancestors, never from a pseudo-element, so with the tint on ::before it sampled pixels instead and
            kept the first colour it caught (a photo scrolling under the bar, the other theme). This strip hands it the
            bar's colour and paints nothing: the colour is clipped to its empty content box. */}
        <span
          aria-hidden
          className="bg-background group-data-[open]/nav:bg-popover group-has-data-[state=open]/header:bg-popover pointer-events-none absolute inset-x-0 top-0 h-0 bg-clip-content pb-3"
        />
      </header>
    </NavigationMenu.Root>
  );
}

/** The menu drawer is a client component, so the store's contact details and categories come down as props. */
async function StoreMobileNav() {
  const [settings, categories] = await Promise.all([
    getStoreSettings(),
    getMenuCategories(),
  ]);

  return (
    <MobileNav
      whatsappNumber={settings.whatsappNumber}
      socialLinks={pickSocialLinks(settings)}
      categories={categories}
    />
  );
}

async function getMenuCategories() {
  "use cache";

  cacheTag("categories-menu", "sitemap");

  const categories = await app.public.categories.queries.findRoots();
  return categories.map(({ name, slug, icon }) => ({ name, slug, icon }));
}
