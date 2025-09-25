import type { Icon, IconProps } from "@tabler/icons-react";
import type { LucideIcon } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import { Heading } from "~/components/heading";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

export default function Header({
  title,
  description,
  Icon,
  className,
  headingLevel = 3,
}: {
  title: string;
  description: string;
  Icon: LucideIcon | ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
  className?: string;
  headingLevel?: 3 | 4 | 5;
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
        <Heading level={headingLevel}>{title}</Heading>
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
          <Icon size={24} className="text-foreground" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 sm:items-start">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}
