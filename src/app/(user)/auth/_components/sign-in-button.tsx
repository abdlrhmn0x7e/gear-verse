"use client";

import { IconBrandGoogle } from "@tabler/icons-react";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";

export function SignInButton() {
  function handleSignIn() {
    void authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  }
  return (
    <Button className="w-full" onClick={handleSignIn}>
      <IconBrandGoogle />
      Sign in with Google
    </Button>
  );
}
