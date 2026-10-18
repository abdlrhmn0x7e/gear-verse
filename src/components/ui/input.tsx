import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import * as React from "react";
import { cn } from "~/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "surface-control surface-field file:text-foreground placeholder:text-muted-foreground aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-9 w-full min-w-0 rounded-full px-4 py-1 text-base transition-[color,border-color,background-color] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 pointer-coarse:h-11 pointer-fine:md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

function NumberInputStepper({
  onIncrement,
  onDecrement,
}: {
  onIncrement: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onDecrement: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <div className="absolute top-1.5 right-3 bottom-1.5 flex flex-col gap-0.5 overflow-hidden rounded-lg opacity-0 transition-opacity group-hover:opacity-100">
      <button
        type="button"
        className="bg-muted text-muted-foreground hover:bg-accent flex h-full w-5 cursor-pointer items-center justify-center transition-colors outline-none [&_svg]:size-2.5"
        onClick={onIncrement}
      >
        <ChevronUpIcon />
      </button>

      <button
        type="button"
        className="bg-muted text-muted-foreground hover:bg-accent flex h-full w-5 cursor-pointer items-center justify-center transition-colors outline-none [&_svg]:size-2.5"
        onClick={onDecrement}
      >
        <ChevronDownIcon />
      </button>
    </div>
  );
}

const numberInputClassName =
  "pr-9 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

function NumberInput({
  className,
  step = 1,
  value,
  onChange,
  onValueChange,
  onFocus,
  ...props
}: React.ComponentProps<typeof Input> & {
  step?: number;
  value: string | number;
  onValueChange?: (value: number | undefined) => void;
}) {
  function parseValue(value: string | number): number | undefined {
    if (value === "") return undefined;

    const parsedValue = typeof value === "number" ? value : Number(value);
    return Number.isNaN(parsedValue) ? undefined : parsedValue;
  }

  const [steppedValue, setSteppedValue] = React.useState<number | undefined>(
    parseValue(value),
  );

  // Follow the value when it changes from outside, e.g. a form reset.
  const [prevValue, setPrevValue] = React.useState(value);
  if (parseValue(value) !== parseValue(prevValue)) {
    setPrevValue(value);
    setSteppedValue(parseValue(value));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.stopPropagation();
    e.preventDefault();
    const nextValue = parseValue(e.target.value);
    setSteppedValue(nextValue);
    onChange?.(e);
    onValueChange?.(nextValue);
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.stopPropagation();
    e.target.select();
    onFocus?.(e);
  }

  function handleIncrement(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    const nextValue = steppedValue ? steppedValue + step : step;
    setSteppedValue(nextValue);
    onValueChange?.(nextValue);
  }

  function handleDecrement(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    const nextValue = steppedValue ? steppedValue - step : 0;
    setSteppedValue(nextValue);
    onValueChange?.(nextValue);
  }

  return (
    <div
      data-slot="input-control"
      className={cn("group relative w-full", className)}
    >
      <Input
        className={numberInputClassName}
        type="number"
        value={steppedValue ?? ""}
        onChange={handleChange}
        onFocus={handleFocus}
        {...props}
      />

      <NumberInputStepper
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
      />
    </div>
  );
}

export { Input, NumberInput, NumberInputStepper, numberInputClassName };
