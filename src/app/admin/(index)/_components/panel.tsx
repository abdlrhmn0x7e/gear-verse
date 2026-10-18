import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

/** A dashboard section: a flat card surface with a title, an optional link out, and its content. */
export function Panel({
  title,
  titleContent,
  description,
  link,
  className,
  children,
}: {
  title: string;
  /** Beside the title: a count and the like. */
  titleContent?: ReactNode;
  description?: ReactNode;
  link?: { href: string; label: string };
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn("bg-card flex min-w-0 flex-col rounded-xl", className)}
    >
      <header className="flex items-start justify-between gap-3 px-4 pt-3.5 pb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium">{title}</h2>
            {titleContent}
          </div>
          {description && (
            <p className="text-muted-foreground mt-0.5 text-xs text-pretty">
              {description}
            </p>
          )}
        </div>
        {link && (
          <Button
            variant="ghost"
            size="xs"
            className="-mr-1.5 shrink-0"
            nativeButton={false}
            render={<Link href={link.href} />}
          >
            {link.label}
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        )}
      </header>
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4">{children}</div>
    </section>
  );
}

/** A quiet line in place of a panel's rows when there is nothing to show. */
export function PanelEmpty({
  icon,
  children,
}: {
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center text-sm text-balance [&_svg]:size-5">
      {icon}
      <p>{children}</p>
    </div>
  );
}

/** A panel's placeholder while its numbers load: the same frame with grey bars for rows. */
export function PanelSkeleton({
  title,
  rows = 3,
  className,
  rowClassName,
}: {
  title: string;
  rows?: number;
  className?: string;
  rowClassName?: string;
}) {
  return (
    <Panel title={title} className={className}>
      <div className="divide-border flex flex-col divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={cn("flex items-center gap-3 py-3", rowClassName)}
          >
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
            <Skeleton className="h-4 w-14" />
          </div>
        ))}
      </div>
    </Panel>
  );
}
