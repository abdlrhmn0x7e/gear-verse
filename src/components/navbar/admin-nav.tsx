import { headers } from "next/headers";
import { auth } from "~/server/auth";
import { Button } from "../ui/button";
import Link from "next/link";
import { ShieldUserIcon } from "lucide-react";

export async function AdminNav() {
  const data = await auth.api.getSession({
    headers: await headers(),
  });

  if (!data) {
    return null;
  }

  return (
    <Button variant="outline" size="icon-lg" asChild>
      <Link href="/admin">
        <ShieldUserIcon />
        <span className="sr-only">Admin</span>
      </Link>
    </Button>
  );
}
