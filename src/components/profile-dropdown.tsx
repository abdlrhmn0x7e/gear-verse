"use client";

import { IconBrandGoogle } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import {
  CheckIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  PackageOpenIcon,
  SunIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "~/lib/auth-client";
import { cn } from "~/lib/utils";
import { LoginDrawerDialog } from "./login-drawer-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";

export function ProfileDropdown({ className }: { className?: string }) {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const { data, isPending: isPendingSession } = authClient.useSession();
  const [openLoginDrawerDialog, setOpenLoginDrawerDialog] = useState(false);
  const { mutate: signOut, isPending: isSigningOut } = useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: () => {
      router.push("/");
    },
  });

  // login anonymously if the user is not authenticated
  useEffect(() => {
    if (!data && !isPendingSession) {
      void authClient.signIn.anonymous();
    }
  }, [data, isPendingSession]);

  if (isSigningOut || isPendingSession) {
    return <Skeleton className="size-9 rounded-full" />;
  }

  if (!data) {
    return null;
  }

  const { user } = data;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn("cursor-pointer rounded-full", className)}
        >
          <Avatar>
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
          align="end"
          sideOffset={8}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar>
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {!user.isAnonymous && (
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                )}
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <SunIcon className="text-muted-foreground mr-1 size-4 h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <MoonIcon className="text-muted-foreground absolute mr-1 size-4 h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  {theme === "light" ? <CheckIcon /> : <SunIcon />}
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  {theme === "dark" ? <CheckIcon /> : <MoonIcon />}
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  {theme === "system" ? <CheckIcon /> : <MonitorIcon />}
                  System
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem asChild>
            <Link href="/orders">
              <PackageOpenIcon />
              Orders
            </Link>
          </DropdownMenuItem>
          {!user.isAnonymous ? (
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOutIcon />
              Logout
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setOpenLoginDrawerDialog(true)}>
              <IconBrandGoogle />
              Login With Google
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <LoginDrawerDialog
        open={openLoginDrawerDialog}
        onOpenChange={setOpenLoginDrawerDialog}
      />
    </>
  );
}
