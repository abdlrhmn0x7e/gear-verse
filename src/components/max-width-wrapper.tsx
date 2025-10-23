import { cn } from "~/lib/utils";

export function MaxWidthWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("container mx-auto px-4 lg:px-8 xl:px-12", className)}>
      {children}
    </div>
  );
}
