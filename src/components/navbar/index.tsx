import {
  IconCategoryFilled,
  IconShoppingBagPlus,
  IconShoppingCart,
} from "@tabler/icons-react";
import { ArrowRightCircleIcon } from "lucide-react";
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
import { Kbd, KbdGroup } from "~/components/ui/kbd";
import { CartDrawer } from "../cart-drawer";
import Header from "../header";
import { ProfileDropdown } from "../profile-dropdown";
import { Button } from "../ui/button";
import { DrawerTrigger } from "../ui/drawer";
import { AdminNav } from "./admin-nav";
import { CategoriesMenu } from "./categories-menu";
import { MobileNav } from "./mobile-nav";
import { NavContent, NavLink, NavTrigger, NavViewport } from "./nav";
import { NavContainer } from "./nav-container";
import { ProductsMenuContent, ProductsMenuSkeleton } from "./products-menu";
import { NavSocialLinks } from "./social-links";

export function Navbar() {
  return (
    <NavigationMenu.Root delayDuration={500}>
      <header className="bg-background/90 fixed inset-x-0 top-0 z-50 h-auto w-full border-b backdrop-blur">
        <NavContainer id="navigation-menu-portal">
          <nav className="flex items-center justify-between">
            <div className="flex flex-1 items-start gap-4">
              <Link href="/">
                <Logo />
              </Link>

              <Suspense>
                <SearchDrawer />
              </Suspense>

              <NavigationMenu.List className="hidden w-full items-center gap-2 lg:flex">
                <NavigationMenu.Item value="explore">
                  <Link href="/products" passHref>
                    <NavTrigger>
                      <IconShoppingBagPlus />
                      <span>Explore Our Store</span>
                    </NavTrigger>
                  </Link>

                  <NavContent className="grid grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                    <div className="col-span-2 space-y-3">
                      <Header
                        title="Recent Products"
                        description="View our recent products"
                        Icon={IconShoppingBagPlus}
                        headingLevel={4}
                      />

                      <Suspense fallback={<ProductsMenuSkeleton />}>
                        <ProductsMenuContent />
                      </Suspense>

                      <Button variant="link" size="lg" asChild>
                        <NavLink href="/products">
                          <ArrowRightCircleIcon />
                          View All Products
                        </NavLink>
                      </Button>
                    </div>

                    <NavSocialLinks />
                  </NavContent>
                </NavigationMenu.Item>

                <NavigationMenu.Item value="categories">
                  <NavigationMenu.Trigger autoFocus={false} asChild>
                    <Button
                      variant="ghost"
                      className="data-[state=open]:border-border"
                      size="lg"
                    >
                      <IconCategoryFilled />
                      <span>Categories</span>
                    </Button>
                  </NavigationMenu.Trigger>

                  <NavContent>
                    <CategoriesMenu />
                  </NavContent>
                </NavigationMenu.Item>
              </NavigationMenu.List>
            </div>

            <div className="flex items-center justify-end gap-2">
              <ProductSearchDialog withOverlay={false}>
                <div className="relative z-10 hidden w-full min-w-64 items-center gap-2 py-2 pr-16 pl-3 lg:flex">
                  <ProductSearchIcon className="size-4" />
                  <ProductSearchPlaceholder>
                    Search Products
                  </ProductSearchPlaceholder>
                </div>

                <KbdGroup className="absolute top-1/2 right-3 z-10 hidden -translate-y-1/2 lg:block">
                  <Kbd>ctrl + K</Kbd>
                </KbdGroup>
              </ProductSearchDialog>

              <div className="flex items-center gap-1">
                <Suspense fallback={null}>
                  <AdminNav />
                </Suspense>

                <Suspense>
                  <CartDrawer
                    Trigger={
                      <DrawerTrigger asChild>
                        <Button variant="outline" size="icon-lg">
                          <IconShoppingCart />
                        </Button>
                      </DrawerTrigger>
                    }
                  />
                </Suspense>

                <ProfileDropdown className="ml-1 border" />
              </div>
            </div>
          </nav>

          <NavViewport />
        </NavContainer>
      </header>

      <Suspense>
        <MobileNav />
      </Suspense>
    </NavigationMenu.Root>
  );
}
