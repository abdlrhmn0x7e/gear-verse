import { getSession } from "~/server/auth";
import { Button } from "../ui/button";
import Link from "next/link";
import { ShieldUserIcon } from "lucide-react";

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
      <span className="sr-only">Admin</span>
    </Button>
  );
}
