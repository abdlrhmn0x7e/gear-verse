import { cn } from "~/lib/utils";

export function MaxWidthWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("container mx-auto px-4 md:px-12 lg:px-24", className)}>
      {children}
    </div>
  );
}
