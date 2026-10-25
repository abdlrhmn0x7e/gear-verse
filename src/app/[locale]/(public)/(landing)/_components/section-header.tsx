import { cn } from "~/lib/utils";

export function SectionHeader({
  id,
  title,
  description,
  action,
  className,
}: {
  id?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl space-y-3">
        <h2 id={id} className="text-headline-sm md:text-headline text-balance">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground text-body-lg text-pretty">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
