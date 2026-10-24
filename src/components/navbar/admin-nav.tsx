import { getSession } from "~/server/auth";
import { Button } from "../ui/button";
// the admin is English only and outside locale routing, so this link never takes a locale prefix
import Link from "next/link";
import { ShieldUserIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function AdminNav() {
  const data = await getSession();

  if (!data) {
    return null;
  }

  if (data.user.role !== "admin") {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      nativeButton={false}
      render={<Link href="/admin" />}
    >
      <ShieldUserIcon />
      <span className="sr-only">{(await getTranslations("nav"))("admin")}</span>
    </Button>
  );
}
