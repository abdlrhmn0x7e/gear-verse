import { cva } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import { Heading } from "~/components/heading";

export default function Header({
  title,
  description,
  Icon,
  headingLevel = 3,
}: {
  title: string;
  description: string;
  Icon: LucideIcon;
  headingLevel?: 3 | 4 | 5;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="from-card to-accent rounded-lg bg-radial-[at_50%_75%] p-px">
        <div className="to-card from-accent flex size-10 items-center justify-center rounded-[calc(var(--radius)-2px)] bg-radial-[at_25%_25%]">
          <Icon size={24} className="text-foreground" />
        </div>
      </div>

      <div>
        <Heading level={headingLevel}>{title}</Heading>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}
