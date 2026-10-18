"use client";

import {
  IconArrowRight,
  IconArrowUpRight,
  IconBrandWhatsapp,
  IconBuildingStore,
  IconCategory,
  IconChevronLeft,
  IconChevronRight,
  IconFolder,
  IconHelpCircle,
  IconLogout,
  IconMessagePlus,
  IconReceipt,
} from "@tabler/icons-react";
import { MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCloseOnBackStack } from "~/hooks/use-close-on-back-stack";
import { authClient } from "~/lib/auth-client";
import { iconsMap } from "~/lib/icons-map";
import type { CategoryIconEnum } from "~/lib/schemas/entities/category";
import { cn } from "~/lib/utils";
import { formatWhatsAppNumber, whatsAppLink } from "~/lib/whatsapp";
import { GoogleSignInButton } from "../login-drawer-dialog";
import { Logo } from "../logo";
import { useSignOut } from "../profile-dropdown";
import { SocialLinks, type SocialLinksSettings } from "../social-links";
import { Spinner } from "../spinner";
import { ThemeSegmentedControl } from "../theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Skeleton } from "../ui/skeleton";

// The menu runs on a critically damped spring (sampled into linear()) at 280ms rather than the drawers' 450ms curve; a
// CSS transition turns back from wherever it is when retargeted, so a close mid-open reverses from that point. A swipe
// leaves faster the harder it was flicked, as Base UI's swipe strength scales the close. With reduced motion asked for,
// the sheets fade in place; a finger still drags them, as that motion is the user's own.
const sheetMotion =
  "duration-[280ms] ease-[linear(0,0.062,0.191,0.337,0.475,0.594,0.692,0.769,0.829,0.874,0.908,0.934,0.952,0.966,0.976,0.983,0.988,0.991,0.994,0.996,1)] data-ending-style:duration-[calc(var(--drawer-swipe-strength,1)*240ms)] data-ending-style:data-swiping:duration-[calc(var(--drawer-swipe-strength,1)*240ms)] motion-reduce:transition-opacity motion-reduce:duration-200 motion-reduce:data-starting-style:transform-none motion-reduce:data-ending-style:transform-none motion-reduce:data-starting-style:opacity-0 motion-reduce:data-ending-style:opacity-0";

/**
 * The phone menu, laid out like iOS Settings: grouped rows with chevrons, the account first, and categories one level
 * deeper in a sheet that stacks on this one. Back, a swipe down or Escape closes the top sheet.
 */
export function MobileNav({
  whatsappNumber,
  socialLinks,
  categories,
}: {
  /** E.164; the menu leaves the number out when the store has none */
  whatsappNumber: string | null;
  socialLinks: SocialLinksSettings;
  categories: { name: string; slug: string; icon: CategoryIconEnum }[];
}) {
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  // back leaves categories for the menu, then the menu for the page
  useCloseOnBackStack(open ? (categoriesOpen ? 2 : 1) : 0, (depth) => {
    setCategoriesOpen(depth >= 2);
    setOpen(depth >= 1);
  });

  // a link anywhere in the stack lands on its page with the whole stack closed
  const closeAll = () => {
    setCategoriesOpen(false);
    setOpen(false);
  };

  return (
    <Drawer
      swipeDirection="down"
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setCategoriesOpen(false);
      }}
    >
      <DrawerTrigger
        render={<Button variant="ghost" size="icon-lg" className="md:hidden" />}
      >
        <MenuIcon />
        <span className="sr-only">Open menu</span>
      </DrawerTrigger>

      <DrawerContent className={sheetMotion}>
        <DrawerHeader className="flex-row items-center justify-between gap-4 pt-2 pb-2">
          <DrawerTitle
            render={<Link href="/" onNavigate={closeAll} className="w-fit" />}
          >
            <Logo className="h-10" />
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            Site navigation
          </DrawerDescription>
          <DrawerClose
            render={<Button variant="ghost" size="icon-lg" className="-me-2" />}
            aria-label="Close menu"
          >
            <XIcon />
          </DrawerClose>
        </DrawerHeader>

        <DrawerBody className="space-y-6 px-2 pt-2">
          <MobileAccount onNavigate={closeAll} />

          <Group label="Shop">
            <RowLink
              href="/products"
              icon={IconBuildingStore}
              onNavigate={closeAll}
            >
              All products
            </RowLink>
            <li className={rowItemClassName}>
              <Drawer open={categoriesOpen} onOpenChange={setCategoriesOpen}>
                <DrawerTrigger className={rowClassName}>
                  <IconCategory className={iconClassName} stroke={1.75} />
                  <span className="flex-1 text-start">Categories</span>
                  <span className="text-muted-foreground tabular-nums">
                    {categories.length}
                  </span>
                  <IconChevronRight className={chevronClassName} />
                </DrawerTrigger>

                <DrawerContent className={sheetMotion}>
                  {/* an iOS navigation bar: back to the menu at the start, the level's title centred */}
                  <DrawerHeader className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-2 pt-2 pb-2">
                    <DrawerClose
                      render={
                        <Button
                          variant="ghost"
                          size="lg"
                          className="justify-self-start px-3"
                        />
                      }
                    >
                      <IconChevronLeft
                        data-icon="inline-start"
                        className="size-5 rtl:-scale-x-100"
                      />
                      Menu
                    </DrawerClose>
                    <DrawerTitle>Categories</DrawerTitle>
                    <DrawerDescription className="sr-only">
                      Shop by category
                    </DrawerDescription>
                  </DrawerHeader>
                  <DrawerBody className="px-2 pt-2">
                    <ul className={groupClassName}>
                      {categories.map((category) => (
                        <RowLink
                          key={category.slug}
                          href={`/categories/${category.slug}`}
                          icon={iconsMap.get(category.icon) ?? IconFolder}
                          onNavigate={closeAll}
                        >
                          {category.name}
                        </RowLink>
                      ))}
                      <RowLink
                        href="/products"
                        icon={IconArrowRight}
                        onNavigate={closeAll}
                      >
                        Shop everything
                      </RowLink>
                    </ul>
                  </DrawerBody>
                </DrawerContent>
              </Drawer>
            </li>
            <RowLink href="/#faq" icon={IconHelpCircle} onNavigate={closeAll}>
              FAQ
            </RowLink>
            <RowLink
              href="/#request"
              icon={IconMessagePlus}
              onNavigate={closeAll}
            >
              Request an item
            </RowLink>
          </Group>

          <Group label="Appearance">
            <li className="p-2">
              <ThemeSegmentedControl />
            </li>
          </Group>

          {whatsappNumber && (
            <Group label="Contact">
              <li className={rowItemClassName}>
                <a
                  href={whatsAppLink(whatsappNumber)}
                  target="_blank"
                  rel="noopener"
                  className={rowClassName}
                >
                  <IconBrandWhatsapp className={iconClassName} stroke={1.75} />
                  <span className="flex-1">WhatsApp</span>
                  <span
                    dir="ltr"
                    className="text-muted-foreground text-sm tabular-nums"
                  >
                    {formatWhatsAppNumber(whatsappNumber)}
                  </span>
                  <IconArrowUpRight className={chevronClassName} />
                </a>
              </li>
            </Group>
          )}

          <SocialLinks
            links={socialLinks}
            variant="ghost"
            className="justify-center"
          />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

// Rows sit in rounded cards of the floating layer's field gray; the hairline between two rows starts at the label, as
// iOS insets it past the icon.
const groupClassName = "overflow-hidden rounded-2xl bg-(--floating-field)";
const rowItemClassName =
  "relative [&:not(:first-child)]:before:absolute [&:not(:first-child)]:before:start-12 [&:not(:first-child)]:before:end-0 [&:not(:first-child)]:before:top-0 [&:not(:first-child)]:before:h-px [&:not(:first-child)]:before:bg-border";
const rowClassName =
  "aria-[current=page]:text-brand-text focus-visible:outline-focus active:bg-foreground/6 flex min-h-12 w-full items-center gap-3 px-4 text-[0.9375rem] font-medium transition-[background-color] duration-150 outline-none select-none focus-visible:outline-2 focus-visible:-outline-offset-2 [-webkit-touch-callout:none] touch-manipulation";
const iconClassName = "size-5 shrink-0 text-muted-foreground";
const chevronClassName =
  "text-muted-foreground/70 size-4 shrink-0 rtl:-scale-x-100";

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-1.5">
      <h2 className="text-muted-foreground px-4 text-[0.8125rem]">{label}</h2>
      <ul className={groupClassName}>{children}</ul>
    </section>
  );
}

function RowLink({
  href,
  icon: Icon,
  onNavigate,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; stroke?: number }>;
  onNavigate: () => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <li className={rowItemClassName}>
      <Link
        href={href}
        onNavigate={onNavigate}
        aria-current={pathname === href ? "page" : undefined}
        className={rowClassName}
      >
        <Icon className={iconClassName} stroke={1.75} />
        <span className="flex-1">{children}</span>
        <IconChevronRight className={chevronClassName} />
      </Link>
    </li>
  );
}

/**
 * The account leads, as the Apple Account does in Settings: who's signed in, their orders and signing out. Signed out,
 * the Google button sits on the sheet itself, since an outlined control on the gray card would read as a field.
 */
function MobileAccount({ onNavigate }: { onNavigate: () => void }) {
  const { data, isPending } = authClient.useSession();
  const { mutate: signOut, isPending: isSigningOut } = useSignOut();

  if (isPending) {
    return <Skeleton className="h-[8.5rem] rounded-2xl" />;
  }

  const user = data && !data.user.isAnonymous ? data.user : null;

  const orders = (
    <RowLink href="/orders" icon={IconReceipt} onNavigate={onNavigate}>
      My orders
    </RowLink>
  );

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="space-y-3 px-2">
          <p className="text-muted-foreground text-sm text-pretty">
            Sign in to see your orders on any device.
          </p>
          <GoogleSignInButton size="xl" className="w-full" />
        </div>
        <ul className={groupClassName}>{orders}</ul>
      </div>
    );
  }

  return (
    <ul className={groupClassName}>
      <li className="flex items-center gap-3 px-4 py-3">
        <Avatar size="lg">
          <AvatarImage src={user.image ?? undefined} alt="" />
          <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="grid min-w-0 flex-1 leading-tight">
          <span className="truncate font-medium">{user.name}</span>
          <span className="text-muted-foreground truncate text-sm">
            {user.email}
          </span>
        </div>
      </li>
      {orders}
      <li className={rowItemClassName}>
        <button
          type="button"
          disabled={isSigningOut}
          onClick={() => signOut()}
          className={cn(rowClassName, "disabled:opacity-50")}
        >
          {isSigningOut ? (
            <Spinner className={iconClassName} />
          ) : (
            <IconLogout className={iconClassName} stroke={1.75} />
          )}
          Sign out
        </button>
      </li>
    </ul>
  );
}
