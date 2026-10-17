import { cn } from "~/lib/utils";

/** A pill toggle for multi-select filters; pressed chips switch to the solid surface. */
export function FilterChip({
  pressed,
  onPressedChange,
  className,
  children,
}: {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-[scale,background-color,color,box-shadow] duration-150 ease-out outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-[0.96]",
        pressed ? "surface-solid" : "surface-control",
        className,
      )}
    >
      {children}
    </button>
  );
}
