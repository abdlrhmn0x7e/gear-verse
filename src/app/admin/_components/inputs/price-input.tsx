import { cn } from "~/lib/utils";

export function PriceInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <div
      className={cn(
        "has-file:text-foreground placeholder:text-muted-foreground/60 selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "has-focus-within:border-ring has-focus-within:ring-ring/50 has-focus-within:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "flex items-center gap-2 overflow-hidden",
        className,
      )}
    >
      <p className="text-muted-foreground select-none">E£</p>
      <input
        className="flex-1 border-none focus-visible:outline-none"
        type="number"
        min={0}
        {...props}
      />
    </div>
  );
}
