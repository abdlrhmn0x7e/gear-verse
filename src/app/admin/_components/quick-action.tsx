import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export function QuickAction({
  title,
  description,
  href,
  Icon,
}: {
  title: string;
  description: string;
  href: string;
  Icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="ring-primary overflow-hidden rounded-lg border transition-all hover:ring-2"
    >
      <div className="from-card to-background flex items-center justify-center gap-3 overflow-hidden rounded-[calc(var(--radius)+1px)] bg-gradient-to-t">
        <div className="bg-background flex size-24 items-center justify-center overflow-hidden border-r">
          <div className="from-card to-primary/20 relative flex size-18 items-center justify-center overflow-hidden rounded-full border bg-gradient-to-t">
            <Icon className="text-accent-foreground size-12" />
            <div className="bg-accent/80 absolute inset-x-0 inset-y-2/3 z-10 size-full -rotate-4" />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
    </Link>
  );
}
