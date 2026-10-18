import { ChevronDownIcon } from "lucide-react";
import Link from "next/link";
import { NavigationMenu } from "radix-ui";
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
import { getStoreSettings } from "~/lib/store-settings";
import { CartDrawer } from "../cart-drawer";
import { ProfileDropdown } from "../profile-dropdown";
import { pickSocialLinks } from "../social-links";
import { AdminNav } from "./admin-nav";
import { CategoriesMenu } from "./categories-menu";
import { MobileNav } from "./mobile-nav";
import { NavContent, NavTextLink, NavTextTrigger, NavViewport } from "./nav";

export function Navbar() {
  return (
    <NavigationMenu.Root delayDuration={100} className="contents">
      {/* the blur and tint live on a layer that runs 4rem past the bar and eases out (a smoothstep) from just under the links to its
          end, so the bar has no bottom edge and no band where it meets a dark panel; the links' row stays fully tinted, keeping
          muted links at 5.02:1 over the plum panel. An open menu turns the same layer into the opaque popover surface, and the
          fade starts in the menu's bottom padding */}
      <header className="before:bg-background/96 supports-backdrop-filter:before:bg-background/94 fixed inset-x-0 top-0 z-50 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:-bottom-16 before:-z-10 before:backdrop-blur-xl before:backdrop-saturate-150 before:transition-[background-color] before:duration-200 before:[mask-image:linear-gradient(to_bottom,#000_calc(100%_-_5rem),rgb(0_0_0/.94)_calc(100%_-_4.25rem),rgb(0_0_0/.78)_calc(100%_-_3.5rem),rgb(0_0_0/.57)_calc(100%_-_2.75rem),rgb(0_0_0/.35)_calc(100%_-_2rem),rgb(0_0_0/.16)_calc(100%_-_1.25rem),rgb(0_0_0/.03)_calc(100%_-_0.5rem),transparent)] has-data-[state=open]:before:bg-popover">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4 md:px-6 lg:px-8">
          <Link
            href="/"
            className="shrink-0 rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            <Logo className="h-10 translate-y-0.5" />
          </Link>

          <NavigationMenu.List className="hidden items-center md:flex">
            <NavigationMenu.Item>
              <NavTextLink href="/products">Store</NavTextLink>
            </NavigationMenu.Item>

            <NavigationMenu.Item value="categories">
              <NavTextTrigger>
                Categories
                <ChevronDownIcon
                  className="size-3.5 transition-[rotate] duration-200 ease-out group-data-[state=open]:rotate-180"
                  aria-hidden
                />
              </NavTextTrigger>
              <NavContent>
                <CategoriesMenu />
              </NavContent>
            </NavigationMenu.Item>

            <NavigationMenu.Item>
              <NavTextLink href="/#faq">FAQ</NavTextLink>
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
                    Search products
                  </ProductSearchPlaceholder>
                </span>
                <Kbd className="absolute end-2 top-1/2 z-10 -translate-y-1/2">
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

            {/* phones switch themes from the menu drawer, keeping the bar to search, cart and menu */}
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
      </header>
    </NavigationMenu.Root>
  );
}

/** The menu drawer is a client component, so the store's contact details come down as props. */
async function StoreMobileNav() {
  const settings = await getStoreSettings();

  return <MobileNav socialLinks={pickSocialLinks(settings)} />;
}
