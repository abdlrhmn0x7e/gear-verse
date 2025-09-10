"use client";

import { Logo } from "./logo";
import { Button } from "./ui/button";
import {
  ArrowRightCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DoorOpenIcon,
  HomeIcon,
  ImageOffIcon,
  ListTreeIcon,
  Menu,
  ShieldUserIcon,
  type LucideIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import {
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
import Image from "next/image";
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
import { Skeleton } from "./ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import type { CategoryTree } from "~/lib/schemas/category";
import { iconsMap } from "~/lib/icons-map";

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
    title: "Listings",
    link: {
      href: "/listings",
    },
    icon: IconShoppingBag,
  },
] as const satisfies ReadonlyArray<NavigationLink>;

export function Navbar() {
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);
  const [categoriesMenuOpen, setCategoriesMenuOpen] = useState(false);
  const { data } = authClient.useSession();

  return (
    <header className="fixed top-5 left-1/2 z-50 container -translate-x-1/2">
      <motion.div
        className="bg-card/40 space-y-3 border px-8 py-2 backdrop-blur"
        style={{ height: "auto", borderRadius: "3rem" }}
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
            <div className="hidden w-full items-center gap-2 lg:flex">
              <Button
                variant="ghost"
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

          <div className="hidden items-center justify-end gap-2 md:flex">
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

          <MobileMenu />
        </nav>

        <AnimatePresence>
          {productsMenuOpen && <ListingsMenu open={productsMenuOpen} />}
        </AnimatePresence>
      </motion.div>
    </header>
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

function ListingsMenu({ open }: { open: boolean }) {
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
          href="/listings"
          className="hover:bg-accent/20 hover:border-border block w-full rounded-lg border border-transparent px-2 py-1 transition-all"
        >
          <Header
            title="Recent Listings"
            description="View our recent listings"
            Icon={IconShoppingBagPlus}
            headingLevel={4}
          />
        </Link>

        <ListingsMenuContent />

        <Button variant="ghost" size="lg" asChild>
          <Link href="/listings">
            <ArrowRightCircleIcon />
            View All Listings
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

function ListingsMenuContent() {
  const { data: listings, isPending: listingsPending } =
    api.listing.getPage.useQuery({
      pageSize: 6,
    });

  if (listingsPending) {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <ListingCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!listings || listings.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <IconShoppingBagX size={64} />
        <div className="text-center">
          <p className="text-lg font-medium">No listings found</p>
          <p className="text-muted-foreground text-sm">
            Stay tuned for more rarities coming soon...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {listings.data.map((listing, idx) => (
        <ListingCard key={`listing-${listing.id}-${idx}`} listing={listing} />
      ))}
    </div>
  );
}

function ListingCard({
  listing,
}: {
  listing: RouterOutputs["listing"]["getPage"]["data"][number];
}) {
  return (
    <Link href={`/listings/${listing.slug}`}>
      <div className="group bg-card space-y-3 rounded-lg border p-1">
        {listing.thumbnail?.url ? (
          <AspectRatio
            ratio={16 / 9}
            className="w-full overflow-hidden rounded-lg border"
          >
            <Image
              src={listing.thumbnail.url}
              alt={listing.title}
              width={512}
              height={512}
              className="size-full object-cover transition-all group-hover:scale-105"
            />
          </AspectRatio>
        ) : (
          <AspectRatio
            ratio={16 / 9}
            className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border"
          >
            <ImageOffIcon className="size-full object-cover" />
          </AspectRatio>
        )}

        <div className="px-2 pb-3">
          <h4 className="font-medium">{listing.title}</h4>
          <p className="text-muted-foreground line-clamp-3 text-sm">
            {listing.summary}
          </p>
        </div>
      </div>
    </Link>
  );
}

function ListingCardSkeleton() {
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
    api.categories.findAll.useQuery();

  if (isPendingCategories || !categories) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
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
        <Button variant="ghost">
          {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
          Categories
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
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
      <DropdownMenuItem asChild key={category.slug}>
        <Link href={`/categories/${category.slug}`}>
          {Icon && <Icon />}
          {category.name}
        </Link>
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuSub>
      <Link href={`/categories/${category.slug}`}>
        <DropdownMenuSubTrigger key={category.slug}>
          {Icon && <Icon className="text-muted-foreground mr-2 size-4" />}
          {category.name}
        </DropdownMenuSubTrigger>
      </Link>

      <DropdownMenuSubContent>
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
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">Navigation</SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-2 px-2">
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.title}
              variant={pathname === item.link.href ? "default" : "ghost"}
              size="lg"
              className="justify-start"
              asChild
            >
              <Link {...item.link}>
                <item.icon />
                {item.title}
              </Link>
            </Button>
          ))}
        </div>
        <SheetFooter></SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
