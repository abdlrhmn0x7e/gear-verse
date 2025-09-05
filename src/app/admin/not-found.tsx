import { HomeIcon, SkullIcon } from "lucide-react";
import Link from "next/link";
import { Heading } from "~/components/heading";
import { Button } from "~/components/ui/button";

export default function AdminNotFoundPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 pb-12">
      <SkullIcon className="size-24" />
      <Heading level={3}>Page Not Found</Heading>
      <p className="text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Button size="lg" asChild>
        <Link href="/admin">
          <HomeIcon />
          Go back to home kiddo
        </Link>
      </Button>
    </div>
  );
}
