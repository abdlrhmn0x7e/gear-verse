"use client";

import { Logo } from "./logo";
import { Button } from "./ui/button";
import {
  ArrowRightCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DoorOpenIcon,
  HomeIcon,
  ListTreeIcon,
  ShieldUserIcon,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useState,
  type ComponentProps,
  type Dispatch,
  type ForwardRefExoticComponent,
  type RefAttributes,
  type SetStateAction,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "~/lib/auth-client";
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
  type Icon,
  type IconProps,
} from "@tabler/icons-react";
import { AspectRatio } from "./ui/aspect-ratio";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import type { CategoryTree } from "~/lib/schemas/category";
import { iconsMap } from "~/lib/icons-map";
import { ImageWithFallback } from "./image-with-fallback";
import { cn } from "~/lib/utils";
import { Skeleton } from "./ui/skeleton";

export interface NavigationLink {
  title: string;
  icon: LucideIcon | ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
  link: ComponentProps<typeof Link>;
}

const NAV_ITEMS = [
  {
    title: "Home",
    link: {
      href: "/",
    },
    icon: HomeIcon,
  },
  {
    title: "Products",
    link: {
      href: "/products",
    },
    icon: IconShoppingBag,
  },
] as const satisfies ReadonlyArray<NavigationLink>;

export function Navbar() {
  const utils = api.useUtils();
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);
  const [categoriesMenuOpen, setCategoriesMenuOpen] = useState(false);
  const { data } = authClient.useSession();

  // Prefetch data
  useEffect(() => {
    void utils.admin.categories.findAll.prefetch();
    void utils.admin.products.getPage.prefetchInfinite({ pageSize: 6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full md:top-5 md:left-1/2 md:container md:-translate-x-1/2">
        <motion.div
          className="bg-card/75 dark:bg-card/90 space-y-3 rounded-none border-b px-8 py-4 backdrop-blur md:rounded-[3rem] md:border"
          style={{ height: "auto" }}
          transition={{
            duration: 0.3,
          }}
          onMouseLeave={() => setProductsMenuOpen(false)}
        >
          <nav className="flex items-center justify-between">
            <div className="flex flex-1 items-center gap-8">
              <Link href="/">
                <Logo />
              </Link>

              {/* Nav Items */}
              <div className="hidden w-full items-center gap-2 md:flex">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => {
                    setProductsMenuOpen((open) => !open);
                    setCategoriesMenuOpen(false);
                  }}
                >
                  {productsMenuOpen ? (
                    <IconShoppingBagMinus />
                  ) : (
                    <IconShoppingBagPlus />
                  )}
                  <span>Explore Our Store</span>
                </Button>

                <CategoriesMenu
                  open={categoriesMenuOpen}
                  setOpen={(open) => {
                    setProductsMenuOpen(false);
                    setCategoriesMenuOpen(open);
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              {data ? (
                <>
                  {data.user.role === "admin" && (
                    <Button variant="ghost" asChild>
                      <Link href="/admin">
                        <ShieldUserIcon />
                        Admin
                      </Link>
                    </Button>
                  )}

                  <ProfileDropdown />
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
      className="grid grid-cols-4 gap-3 overflow-hidden"
    >
      <div className="col-span-3 space-y-3">
        <Link
          href="/products"
          className="hover:bg-accent/20 hover:border-border block w-full rounded-lg border border-transparent px-2 py-1 transition-all"
        >
          <Header
            title="Recent Products"
            description="View our recent products"
            Icon={IconShoppingBagPlus}
            headingLevel={4}
          />
        </Link>

        <ProductsMenuContent />

        <Button variant="ghost" size="lg" asChild>
          <Link href="/products">
            <ArrowRightCircleIcon />
            View All Products
          </Link>
        </Button>
      </div>

      <div className="col-span-1 space-y-1 p-4">
        {SOCIAL_LINKS.map((link) => (
          <Button
            variant="ghost"
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
    api.user.products.getPage.useQuery({
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
  products: RouterOutputs["user"]["products"]["getPage"]["data"][number];
}) {
  return (
    <Link href={`/products/${products.slug}`}>
      <div className="group bg-card space-y-3 rounded-lg border p-1">
        <AspectRatio
          ratio={16 / 9}
          className="w-full overflow-hidden rounded-lg border"
        >
          <ImageWithFallback
            src={products.thumbnail}
            alt={products.name}
            width={512}
            height={512}
            className="size-full border-none object-cover transition-all group-hover:scale-105"
          />
        </AspectRatio>

        <div className="px-2 pb-3">
          <h4 className="font-medium">{products.name}</h4>
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

function CategoriesMenu({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { data: categories, isPending: isPendingCategories } =
    api.admin.categories.findAll.useQuery();

  if (isPendingCategories || !categories) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="lg">
            <ChevronDownIcon />
            Categories
          </Button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="lg">
          {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
          Categories
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel className="text-muted-foreground flex items-center gap-2">
          <ListTreeIcon className="size-4" />
          Our Verse Categories
        </DropdownMenuLabel>
        {categories.map((category) => (
          <CategoryDropdownMenuContent key={category.id} category={category} />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CategoryDropdownMenuContent({ category }: { category: CategoryTree }) {
  const Icon = iconsMap.get(category.icon);

  if (!category.children || category.children.length === 0) {
    return (
      <DropdownMenuItem asChild key={category.slug} className="h-10 min-w-3xs">
        <Link href={`/categories/${category.slug}`}>
          {Icon && <Icon className="size-6" />}
          {category.name}
        </Link>
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuSub>
      <Link href={`/categories/${category.slug}`}>
        <DropdownMenuSubTrigger key={category.slug} className="h-10 min-w-3xs">
          {Icon && <Icon className="text-muted-foreground mr-2 size-6" />}
          {category.name}
        </DropdownMenuSubTrigger>
      </Link>

      <DropdownMenuSubContent>
        <DropdownMenuLabel className="text-muted-foreground flex items-center gap-2">
          {category.name}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {category.children?.map((child) => (
          <CategoryDropdownMenuContent key={child.slug} category={child} />
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

function MobileMenu() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 md:hidden">
      <nav className="bg-card/80 border-t p-2 backdrop-blur">
        <ul className="grid grid-cols-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.title} className="flex items-center justify-center">
              <Button
                variant="ghost"
                className={cn(
                  "flex-col items-center gap-0 py-8",
                  pathname === item.link.href && "text-primary-foreground",
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
