"use client";

import { Logo } from "./logo";
import { Button } from "./ui/button";
import {
  ArrowRightCircleIcon,
  DoorOpenIcon,
  HomeIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  ShieldUserIcon,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useState,
  type ComponentProps,
  type ForwardRefExoticComponent,
  type RefAttributes,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProfileDropdown } from "./profile-dropdown";
import { AnimatePresence, motion } from "motion/react";
import Header from "~/components/header";
import { api, type RouterOutputs } from "~/trpc/react";
import {
  IconBrandDiscord,
  IconBrandFacebook,
  IconBrandTiktok,
  IconShoppingBag,
  IconShoppingBagMinus,
  IconShoppingBagPlus,
  IconShoppingBagX,
  IconShoppingCart,
  IconShoppingCartCheck,
  type Icon,
  type IconProps,
} from "@tabler/icons-react";
import { AspectRatio } from "./ui/aspect-ratio";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "~/components/ui/input-group";

import { ImageWithFallback } from "./image-with-fallback";
import { cn } from "~/lib/utils";
import { Skeleton } from "./ui/skeleton";
import type { User } from "better-auth";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { useIsMobile } from "~/hooks/use-mobile";
import { formatCurrency } from "~/lib/utils/format-currency";
import { useCartSearchParams } from "~/hooks/use-cart-search-params";
import { useRouter } from "next/navigation";
import {
  ProductSearchItem,
  ProductSearchDialog,
  ProductSearchIcon,
  ProductSearchLoading,
  ProductSearchPlaceholder,
  ProductSearchError,
  ProductSearchEmpty,
} from "~/app/admin/_components/product-search-dialog";
import { Kbd, KbdGroup } from "./ui/kbd";
import { useDebounce } from "~/hooks/use-debounce";
import { Separator } from "./ui/separator";

export interface NavigationLink {
  title: string;
  icon: LucideIcon | ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
  link: ComponentProps<typeof Link>;
  order: number;
}

const NAV_ITEMS = [
  {
    title: "Home",
    link: {
      href: "/",
    },
    order: 1,
    icon: HomeIcon,
  },
  {
    title: "Products",
    link: {
      href: "/products",
    },
    order: 3,
    icon: IconShoppingBag,
  },
] as const satisfies ReadonlyArray<NavigationLink>;

export function Navbar({
  user,
}: {
  user: (User & { role?: string | null | undefined }) | null;
}) {
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);

  const utils = api.useUtils();
  const { data: cart, isPending: isPendingCart } =
    api.public.carts.queries.find.useQuery();
  const [, setParams] = useCartSearchParams();
  const pathname = usePathname();

  // prefetch products
  useEffect(() => {
    void utils.public.products.queries.getPage.prefetch({
      pageSize: 6,
    });
  }, [utils]);

  useEffect(() => {
    setProductsMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full md:top-5 md:left-1/2 md:container md:-translate-x-1/2">
        <motion.div
          className="bg-card/90 dark:bg-card/80 space-y-3 rounded-none border-b px-4 py-4 backdrop-blur md:rounded-[3rem] md:border md:px-8"
          style={{ height: "auto" }}
          transition={{
            duration: 0.3,
          }}
          onMouseLeave={() => setProductsMenuOpen(false)}
        >
          <nav className="flex items-center justify-between">
            <div className="flex flex-1 items-center gap-2">
              <Link href="/" className="lg:mr-4">
                <Logo />
              </Link>

              <SearchDrawer />

              <ProductSearchDialog withOverlay={false}>
                <div className="relative z-10 hidden w-full min-w-48 items-center gap-2 py-2 pr-16 pl-3 lg:flex">
                  <ProductSearchIcon className="size-4" />
                  <ProductSearchPlaceholder>
                    Search Products
                  </ProductSearchPlaceholder>
                </div>

                <KbdGroup className="absolute top-1/2 right-3 z-10 hidden -translate-y-1/2 pt-1 lg:block">
                  <Kbd>⌘ + K</Kbd>
                </KbdGroup>
              </ProductSearchDialog>

              {/* Nav Items */}
              <div className="hidden w-full items-center gap-2 md:flex">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    setProductsMenuOpen((open) => !open);
                  }}
                >
                  {productsMenuOpen ? (
                    <IconShoppingBagMinus />
                  ) : (
                    <IconShoppingBagPlus />
                  )}
                  <span>Explore Our Store</span>
                </Button>

                {/* <CategoriesMenu
                  open={categoriesMenuOpen}
                  setOpen={(open) => {
                    setProductsMenuOpen(false);
                    setCategoriesMenuOpen(open);
                  }}
                /> */}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              {user ? (
                <>
                  {user.role === "admin" && (
                    <Button variant="ghost" asChild>
                      <Link href="/admin">
                        <ShieldUserIcon />
                        <span className="hidden lg:block">Admin</span>
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => setParams({ cart: true })}
                    disabled={isPendingCart}
                  >
                    <IconShoppingCart />
                    <span className="hidden lg:block">Cart</span>
                  </Button>
                  <ProfileDropdown user={user} />
                </>
              ) : (
                <Button asChild>
                  <Link href="/auth">
                    <DoorOpenIcon />
                    Login
                  </Link>
                </Button>
              )}
            </div>
          </nav>

          <AnimatePresence>
            {productsMenuOpen && <ProductsMenu open={productsMenuOpen} />}
          </AnimatePresence>
        </motion.div>
      </header>

      {cart && <CartDrawer cart={cart} />}
      <MobileMenu />
    </>
  );
}

const productsMenuVariants = {
  open: {
    height: "auto",
  },
  closed: {
    height: 0,
  },
  transition: {
    duration: 0.3,
    ease: "easeInOut",
  },
};

const SOCIAL_LINKS = [
  {
    name: "Join Our Discord",
    url: "https://discord.gg/CRDZxAD35N",
    icon: IconBrandDiscord,
  },
  {
    name: "Follow Us On Tiktok",
    url: "https://www.tiktok.com/@gearverse.eg",
    icon: IconBrandTiktok,
  },
  {
    name: "Follow Us On Facebook",
    url: "https://www.facebook.com/profile.php?id=61575728973616",
    icon: IconBrandFacebook,
  },
];

function ProductsMenu({ open }: { open: boolean }) {
  return (
    <motion.div
      variants={productsMenuVariants}
      initial="closed"
      exit="closed"
      style={{
        maxHeight: "calc(100vh - 8rem)",
        paddingBottom: "1rem",
      }}
      animate={open ? "open" : "closed"}
      className="mx-auto grid max-w-screen-xl grid-cols-4 gap-3 overflow-hidden px-3"
    >
      <div className="col-span-3 space-y-3">
        <Header
          title="Recent Products"
          description="View our recent products"
          Icon={IconShoppingBagPlus}
          headingLevel={4}
        />

        <ProductsMenuContent />

        <Button variant="link" size="lg" asChild>
          <Link href="/products">
            <ArrowRightCircleIcon />
            View All Products
          </Link>
        </Button>
      </div>

      <div className="col-span-1 space-y-1">
        {SOCIAL_LINKS.map((link) => (
          <Button
            variant="link"
            size="lg"
            className="w-full justify-start"
            asChild
            key={link.name}
          >
            <a href={link.url} target="_blank">
              <link.icon />
              {link.name}
            </a>
          </Button>
        ))}
      </div>
    </motion.div>
  );
}

function ProductsMenuContent() {
  const { data: products, isPending: productsPending } =
    api.public.products.queries.getPage.useQuery({
      pageSize: 6,
    });
  if (productsPending) {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!products || products.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <IconShoppingBagX size={64} />
        <div className="text-center">
          <p className="text-lg font-medium">No products found</p>
          <p className="text-muted-foreground text-sm">
            Stay tuned for more rarities coming soon...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {products.data.map((product, idx) => (
        <ProductCard key={`product-${product.id}-${idx}`} products={product} />
      ))}
    </div>
  );
}

function ProductCard({
  products,
}: {
  products: RouterOutputs["public"]["products"]["queries"]["getPage"]["data"][number];
}) {
  return (
    <Link href={`/products/${products.slug}`}>
      <div className="group bg-card space-y-3 rounded-lg border p-1">
        <AspectRatio
          ratio={16 / 9}
          className="w-full overflow-hidden rounded-lg border"
        >
          <ImageWithFallback
            src={products.thumbnailUrl}
            alt={products.title}
            width={512}
            height={512}
            className="size-full border-none object-cover"
          />
        </AspectRatio>

        <div className="px-2 pb-3">
          <h4 className="font-medium">{products.title}</h4>
          <p className="text-muted-foreground line-clamp-3 text-sm">
            {products.summary}
          </p>
        </div>
      </div>
    </Link>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-card space-y-3 overflow-hidden rounded-lg border p-1">
      <AspectRatio
        ratio={16 / 9}
        className="w-full overflow-hidden rounded-lg border"
      >
        <Skeleton className="size-full rounded-md" />
      </AspectRatio>

      <div className="space-y-1 px-2 pb-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-2 w-24" />
      </div>
    </div>
  );
}

function MobileMenu() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      <nav className="bg-card/95 border-t p-2 backdrop-blur">
        <ul className="grid grid-cols-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.title} className="flex items-center justify-center">
              <Button
                variant="ghost"
                className={cn(
                  "min-w-24 flex-col items-center gap-0 py-8",
                  pathname === item.link.href &&
                    "text-primary dark:text-accent-foreground",
                )}
                size="lg"
                asChild
              >
                <Link href={item.link.href} key={item.title}>
                  <item.icon className="size-6" />
                  {item.title}
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function CartDrawer({
  cart,
}: {
  cart: RouterOutputs["public"]["carts"]["queries"]["find"];
}) {
  const utils = api.useUtils();
  const router = useRouter();
  const { mutate: removeItem, isPending: removingItem } =
    api.public.carts.mutations.removeItem.useMutation({
      onSuccess: () => {
        void utils.public.carts.queries.find.invalidate();
        router.refresh();
      },
    });
  const { mutate: addItem, isPending: addingItem } =
    api.public.carts.mutations.addItem.useMutation({
      onSuccess: () => {
        void utils.public.carts.queries.find.invalidate();
        router.refresh();
      },
    });
  const [params, setParams] = useCartSearchParams();
  const isMobile = useIsMobile();

  function handleOpenChange(open: boolean) {
    void setParams({ cart: open ? open : null });
  }

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={params.cart ?? false}
      onOpenChange={handleOpenChange}
    >
      <DrawerContent className="sm:h-auto">
        <DrawerHeader>
          <DrawerTitle className="text-2xl font-bold">
            Shopping Cart
          </DrawerTitle>
          <DrawerDescription></DrawerDescription>
        </DrawerHeader>

        <div className="space-y-3 divide-y px-4 [&>div]:pb-4">
          {cart.items.length > 0 ? (
            cart.items.map((item, idx) => (
              <div key={`cart-item-${idx}`} className="flex items-center gap-3">
                <ImageWithFallback
                  src={item.thumbnailUrl}
                  alt={item.title ?? `Product ${idx + 1}`}
                  className="size-24 shrink-0 rounded-md"
                  width={256}
                  height={256}
                />
                <div className="flex-1 space-y-1">
                  <p className="text-left text-sm font-medium">
                    {item.title} - {item.values.join(", ")}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-sm">
                      Total Amount
                    </p>
                    <p className="text-sm">
                      {formatCurrency((item.price ?? 0) * item.quantity)}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex w-full items-center gap-6 rounded-lg border p-1",
                      removingItem ||
                        (addingItem && "pointer-events-none opacity-50"),
                    )}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-1 md:size-6"
                      onClick={() =>
                        removeItem({
                          productVariantId: item.id ?? 0,
                        })
                      }
                      disabled={removingItem}
                    >
                      <MinusIcon className="size-4" />
                    </Button>
                    <p className="shrink-0 text-xs">{item.quantity}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-1 md:size-6"
                      onClick={() =>
                        addItem({
                          productVariantId: item.id ?? 0,
                        })
                      }
                      disabled={
                        addingItem ||
                        item.stock === 0 ||
                        (item.stock ?? 0) <= item.quantity
                      }
                    >
                      <PlusIcon className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <IconShoppingBagX size={64} />
              <p className="text-muted-foreground text-sm">
                Your cart is empty
              </p>
            </div>
          )}
        </div>

        <DrawerFooter>
          <Button variant="default" className="w-full" size="lg" asChild>
            <Link
              href="/checkout"
              className={cn(
                cart.items.length <= 0 && "pointer-events-none opacity-50",
              )}
            >
              <IconShoppingCartCheck className="size-4" />
              Proceed to Checkout
            </Link>
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function SearchDrawer() {
  const [search, setSearch] = useState("");
  const pathname = usePathname();
  const debouncedSearch = useDebounce(search, 500);
  const [open, setOpen] = useState(false);
  const {
    data: products,
    isPending: productsPending,
    isError: productsError,
  } = api.public.products.queries.getPage.useQuery({
    pageSize: 4,
    filters: {
      title: debouncedSearch,
    },
  });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="dark:bg-card bg-card w-1/2 justify-start md:w-1/3 lg:hidden"
        >
          <SearchIcon />
          Search...
        </Button>
      </DrawerTrigger>
      <DrawerContent className="min-h-[75svh]">
        <DrawerHeader>
          <DrawerTitle>Search Products</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-4 p-4">
          <InputGroup>
            <InputGroupInput
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>

          <Separator />

          {productsPending && <ProductSearchLoading />}
          {productsError && <ProductSearchError />}
          {products && products.data.length === 0 && <ProductSearchEmpty />}

          {products && products.data.length > 0 && (
            <ul className="flex flex-col gap-2">
              {products.data.map((product, idx) => (
                <ProductSearchItem
                  key={`product-${product.id}-${idx}`}
                  product={product}
                  hover={null}
                  index={idx}
                />
              ))}
            </ul>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
