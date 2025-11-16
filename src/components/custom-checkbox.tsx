import type { ComponentProps, PropsWithChildren } from "react";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { cn } from "~/lib/utils";

export function CustomCheckbox({
  id,
  children,
  className,
  ...props
}: PropsWithChildren<ComponentProps<typeof Checkbox>>) {
  return (
    <Label
      htmlFor={`${id}-checkbox`}
      className={cn(
        "has-data[state=checked]:text-primary-foreground has-data-[state=checked]:bg-primary/50 has-data-[state=checked]:border-primary cursor-pointer rounded-lg border p-2 px-4 transition-all",
        className,
      )}
    >
      <Checkbox className="hidden" id={`${id}-checkbox`} {...props} />
      {children}
    </Label>
  );
}
