import type { TablerIcon } from "@tabler/icons-react";
import type { LucideIcon } from "lucide-react";
import { Heading } from "~/components/heading";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

export default function Header({
  title,
  description,
  Icon,
  className,
  headingLevel = 3,
  headingAs,
}: {
  title: string;
  description: string;
  Icon: LucideIcon | TablerIcon;
  className?: string;
  headingLevel?: 3 | 4 | 5;
  /** render the title as this heading level while keeping headingLevel's look */
  headingAs?: 1 | 2 | 3 | 4 | 5 | 6;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left",
        className,
      )}
    >
      <div className="from-card to-accent rounded-lg bg-radial-[at_50%_75%] p-px">
        <div className="to-card from-accent flex size-10 items-center justify-center rounded-[calc(var(--radius)-2px)] bg-radial-[at_25%_25%]">
          <Icon className="text-foreground size-5" />
        </div>
      </div>

      <div>
        <Heading level={headingLevel} as={headingAs}>
          {title}
        </Heading>
        <p
          className={cn(
            "text-muted-foreground text-sm",
            headingLevel === 5 && "text-xs",
          )}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

export function HeaderSkeleton({ Icon }: { Icon: LucideIcon }) {
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row">
      <div className="from-card to-accent rounded-lg bg-radial-[at_50%_75%] p-px">
        <div className="to-card from-accent flex size-10 items-center justify-center rounded-[calc(var(--radius)-2px)] bg-radial-[at_25%_25%]">
          <Icon className="text-foreground size-5" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 sm:items-start">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}
