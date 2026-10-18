"use client";

import { IconBrandWhatsapp, IconFolder } from "@tabler/icons-react";
import { LogOutIcon, MenuIcon } from "lucide-react";
import Link from "next/link";
import { useCloseOnBack } from "~/hooks/use-close-on-back";
import { useDialog } from "~/hooks/use-dialog";
import { authClient } from "~/lib/auth-client";
import { iconsMap } from "~/lib/icons-map";
import type { CategoryIconEnum } from "~/lib/schemas/entities/category";
import { GoogleSignInButton } from "../login-drawer-dialog";
import { Logo } from "../logo";
import { useSignOut } from "../profile-dropdown";
import { Spinner } from "../spinner";
import { ThemeSegmentedControl } from "../theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Skeleton } from "../ui/skeleton";
import { WhatsAppNumberLink } from "../whatsapp-number-link";
import { SocialLinks, type SocialLinksSettings } from "../social-links";

const PRIMARY_LINKS = [
  { title: "Home", href: "/" },
  { title: "Store", href: "/products" },
  { title: "FAQ", href: "/#faq" },
  { title: "My orders", href: "/orders" },
];

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
  const drawer = useDialog();
  useCloseOnBack(drawer.props.open, drawer.dismiss);

  return (
    <Drawer direction="bottom" {...drawer.props}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon-lg" className="md:hidden">
          <MenuIcon />
          <span className="sr-only">Open menu</span>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="p-6">
        <DrawerHeader className="flex-row items-center justify-between gap-4 px-2 pt-2 pb-2 text-left">
          <DrawerTitle asChild>
            <Link href="/" onNavigate={drawer.dismiss} className="w-fit">
              <Logo className="h-11" />
            </Link>
          </DrawerTitle>
          {whatsappNumber && (
            <WhatsAppNumberLink
              number={whatsappNumber}
              className="bg-tile active:bg-tile-hover inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-sm font-medium tabular-nums"
            >
              <IconBrandWhatsapp
                className="size-5 shrink-0"
                stroke={1.75}
                aria-hidden
              />
            </WhatsAppNumberLink>
          )}
          <DrawerDescription className="sr-only">
            Site navigation
          </DrawerDescription>
        </DrawerHeader>

        <DrawerBody className="px-2">
          <nav aria-label="Mobile" className="flex flex-col gap-10 py-4">
            <ul className="flex flex-col">
              {PRIMARY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onNavigate={drawer.dismiss}
                    className="text-title focus-visible:outline-focus block rounded-md py-2 transition-opacity duration-150 outline-none focus-visible:outline-2 active:opacity-60"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>

            <MobileAccount />

            <div className="space-y-3">
              <p className="text-muted-foreground text-sm">Categories</p>
              <ul className="grid grid-cols-2 gap-2">
                {categories.map((category) => {
                  const Icon = iconsMap.get(category.icon) ?? IconFolder;
                  return (
                    <li key={category.slug}>
                      <Link
                        href={`/categories/${category.slug}`}
                        onNavigate={drawer.dismiss}
                        className="bg-tile active:bg-tile-hover focus-visible:outline-focus flex flex-col gap-4 rounded-2xl p-4 text-sm font-medium outline-none focus-visible:outline-2"
                      >
                        <Icon className="size-5" stroke={1.75} aria-hidden />
                        {category.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex items-center justify-between gap-4">
              <p className="text-muted-foreground text-sm">Theme</p>
              <ThemeSegmentedControl />
            </div>

            <SocialLinks links={socialLinks} />
          </nav>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

function MobileAccount() {
  const { data, isPending } = authClient.useSession();
  const { mutate: signOut, isPending: isSigningOut } = useSignOut();

  if (isPending) {
    return <Skeleton className="h-12 rounded-full" />;
  }

  // signing in is a single Google button, so the menu offers it in place rather than stacking a sign-in drawer on top
  if (!data || data.user.isAnonymous) {
    return (
      <div className="space-y-3">
        <p className="text-muted-foreground text-sm">
          Sign in or create an account
        </p>
        <GoogleSignInButton size="xl" className="w-full" />
      </div>
    );
  }

  const { user } = data;

  return (
    <div className="flex items-center gap-3">
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
      <Button
        variant="outline"
        disabled={isSigningOut}
        onClick={() => signOut()}
      >
        {isSigningOut ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <LogOutIcon data-icon="inline-start" />
        )}
        Sign out
      </Button>
    </div>
  );
}
