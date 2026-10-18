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
      <header className="bg-background/80 supports-backdrop-filter:bg-background/70 fixed inset-x-0 top-0 z-50 backdrop-blur-xl backdrop-saturate-150 transition-[background-color] duration-200 has-data-[state=open]:bg-background">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4 md:px-6 lg:px-8">
          <Link
            href="/"
            className="shrink-0 rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            <Logo className="h-9" />
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

            <Suspense>
              <CartDrawer />
            </Suspense>

            <ProfileDropdown className="ml-1" />

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
