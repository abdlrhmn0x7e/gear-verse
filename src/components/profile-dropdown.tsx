"use client";

import { useMutation } from "@tanstack/react-query";
import {
  CheckIcon,
  LogInIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  PackageOpenIcon,
  SunIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
import { Button } from "./ui/button";

/** Signs out, then lands on the home page, where the anonymous session takes over again. */
export function useSignOut() {
  const router = useRouter();
  return useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: () => {
      router.push("/");
      router.refresh();
    },
  });
}

/** Only real accounts get the avatar menu; visitors without a session or with an anonymous one get a Sign in button. */
export function ProfileDropdown({ className }: { className?: string }) {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const { data, isPending: isPendingSession } = authClient.useSession();
  const { mutate: signOut, isPending: isSigningOut } = useSignOut();

  // login anonymously if the user is not authenticated
  useEffect(() => {
    if (!data && !isPendingSession) {
      void authClient.signIn.anonymous();
      return;
    }
    router.refresh();
  }, [data, isPendingSession, router]);

  if (isSigningOut || isPendingSession) {
    // most visitors end up with the Sign in button, so its space is held without painting a placeholder
    return (
      <span aria-hidden className={cn("invisible", className)}>
        <SignInButtonShape />
      </span>
    );
  }

  if (!data || data.user.isAnonymous) {
    return <SignInButton className={className} />;
  }

  const { user } = data;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "focus-visible:outline-focus cursor-pointer rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
          className,
        )}
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
              <span className="text-muted-foreground truncate text-xs">
                {user.email}
              </span>
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
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SignInButtonShape(props: React.ComponentProps<typeof Button>) {
  return (
    <Button variant="outline" {...props}>
      <LogInIcon data-icon="inline-start" />
      Sign in
    </Button>
  );
}

export function SignInButton({ className }: { className?: string }) {
  return (
    <LoginDrawerDialog>
      <SignInButtonShape className={className} />
    </LoginDrawerDialog>
  );
}
