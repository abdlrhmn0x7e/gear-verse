"use client";

import { IconFolder } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { LogOutIcon, MenuIcon } from "lucide-react";
import Link from "next/link";
import { useDialog } from "~/hooks/use-dialog";
import { authClient } from "~/lib/auth-client";
import { iconsMap } from "~/lib/icons-map";
import { useTRPC } from "~/trpc/client";
import { LoginDrawerDialog } from "../login-drawer-dialog";
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
import { SOCIAL_LINKS } from "./social-links";

const PRIMARY_LINKS = [
  { title: "Home", href: "/" },
  { title: "Store", href: "/products" },
  { title: "FAQ", href: "/#faq" },
  { title: "My orders", href: "/orders" },
];

export function MobileNav() {
  const trpc = useTRPC();
  const drawer = useDialog();
  const loginDialog = useDialog();
  const { data: categories, isPending } = useQuery(
    trpc.public.categories.queries.findRoots.queryOptions(),
  );

  return (
    <>
      <Drawer direction="bottom" {...drawer.props}>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon-lg" className="md:hidden">
            <MenuIcon />
            <span className="sr-only">Open menu</span>
          </Button>
        </DrawerTrigger>

        <DrawerContent className="p-6">
          <DrawerHeader className="px-2 pt-2 pb-2 text-left">
            <DrawerTitle asChild>
              <Link href="/" onNavigate={drawer.dismiss} className="w-fit">
                <Logo className="h-9" />
              </Link>
            </DrawerTitle>
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
                      className="text-title focus-visible:outline-focus block rounded-md py-2 outline-none focus-visible:outline-2"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>

              <MobileAccount
                onSignIn={() => {
                  drawer.dismiss();
                  loginDialog.trigger();
                }}
              />

              <div className="space-y-3">
                <p className="text-muted-foreground text-sm">Categories</p>
                <ul className="grid grid-cols-2 gap-2">
                  {isPending || !categories
                    ? Array.from({ length: 4 }).map((_, index) => (
                        <li key={index}>
                          <Skeleton className="h-20 rounded-2xl" />
                        </li>
                      ))
                    : categories.map((category) => {
                        const Icon = iconsMap.get(category.icon) ?? IconFolder;
                        return (
                          <li key={category.slug}>
                            <Link
                              href={`/categories/${category.slug}`}
                              onNavigate={drawer.dismiss}
                              className="bg-card active:bg-accent focus-visible:outline-focus flex flex-col gap-4 rounded-2xl p-4 text-sm font-medium outline-none focus-visible:outline-2"
                            >
                              <Icon
                                className="size-5"
                                stroke={1.75}
                                aria-hidden
                              />
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

              <ul className="flex gap-2">
                {SOCIAL_LINKS.map((link) => (
                  <li key={link.url}>
                    <Button variant="outline" size="icon-lg" asChild>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <link.icon stroke={1.75} />
                        <span className="sr-only">{link.label}</span>
                      </a>
                    </Button>
                  </li>
                ))}
              </ul>
            </nav>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* lives outside the menu so the menu can close before the sign-in drawer opens */}
      <LoginDrawerDialog {...loginDialog.props} />
    </>
  );
}

function MobileAccount({ onSignIn }: { onSignIn: () => void }) {
  const { data, isPending } = authClient.useSession();
  const { mutate: signOut, isPending: isSigningOut } = useSignOut();

  if (isPending) {
    return <Skeleton className="h-12 rounded-full" />;
  }

  if (!data || data.user.isAnonymous) {
    return (
      <Button variant="outline" size="xl" className="w-full" onClick={onSignIn}>
        Sign in
      </Button>
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
        {isSigningOut ? <Spinner /> : <LogOutIcon />}
        Sign out
      </Button>
    </div>
  );
}
