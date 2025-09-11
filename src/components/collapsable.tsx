import { type PropsWithChildren, useState } from "react";
import { cn } from "~/lib/utils";
import { Sparkles } from "lucide-react";

export function Collapsable({
  children,
  className,
  defaultOpen,
  title,
}: PropsWithChildren<{
  className?: string;
  title: string | React.ReactNode;
  defaultOpen?: boolean;
}>) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  function toggleOpen() {
    setOpen((prev) => !prev);
  }

  return (
    <div
      className={cn(
        "[&:has(.collapse-trigger:hover)]:border-primary [&:has(.collapse-trigger:hover)]:bg-accent/10 space-y-2 rounded-lg border-2 border-dashed transition-all duration-300",
      )}
    >
      <div
        onClick={toggleOpen}
        className="collapse-trigger flex w-full cursor-pointer items-center justify-between px-8 pt-6 pb-4"
      >
        <h4 className="relative flex-1">{title}</h4>

        <Sparkles
          className={cn(
            "stroke-muted-foreground fill-muted-foreground transition-all duration-300",
            open && "stroke-primary fill-primary rotate-180",
          )}
        />
      </div>

      <div
        className={cn(
          "grid gap-2 transition-all duration-300",
          open ? "mt-2 grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className={cn("px-8 pb-4", className)}>{children}</div>
        </div>
      </div>
    </div>
  );
}
