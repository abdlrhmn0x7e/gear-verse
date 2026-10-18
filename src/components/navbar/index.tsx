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
import { CartDrawer } from "../cart-drawer";
import { ProfileDropdown } from "../profile-dropdown";
import { AdminNav } from "./admin-nav";
import { CategoriesMenu } from "./categories-menu";
import { MobileNav } from "./mobile-nav";
import { NavContent, NavTextLink, NavTextTrigger, NavViewport } from "./nav";

export function Navbar() {
  return (
    <NavigationMenu.Root delayDuration={100} className="contents">
      {/* the blur and tint live on a layer that runs 2rem past the bar and fades over its last 3rem, so the bar has no bottom edge;
          an open menu turns the same layer opaque, and the fade lands in the menu's bottom padding */}
      <header className="before:bg-background/96 supports-backdrop-filter:before:bg-background/94 fixed inset-x-0 top-0 z-50 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:-bottom-8 before:-z-10 before:backdrop-blur-xl before:backdrop-saturate-150 before:transition-[background-color] before:duration-200 before:[mask-image:linear-gradient(to_bottom,black_calc(100%-3rem),transparent)] has-data-[state=open]:before:bg-background">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4 md:px-6 lg:px-8">
          <Link
            href="/"
            className="shrink-0 rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            <Logo className="h-11" />
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

          <div className="ml-auto flex items-center gap-1">
            <div className="mr-1 hidden lg:block">
              <ProductSearchDialog withOverlay={false}>
                <span className="relative z-10 flex h-9 w-60 items-center gap-2 pr-14 pl-4">
                  <ProductSearchIcon className="text-muted-foreground size-4" />
                  <ProductSearchPlaceholder className="text-sm">
                    Search products
                  </ProductSearchPlaceholder>
                </span>
                <Kbd className="absolute top-1/2 right-2 z-10 -translate-y-1/2">
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

            <Suspense>
              <CartDrawer />
            </Suspense>

            <ProfileDropdown className="ml-1 hidden md:inline-flex" />

            <Suspense>
              <MobileNav />
            </Suspense>
          </div>
        </div>

        <NavViewport />
      </header>
    </NavigationMenu.Root>
  );
}
