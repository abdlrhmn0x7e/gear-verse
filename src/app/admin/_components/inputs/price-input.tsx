import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";

export function PriceInput({
  value,
  ...props
}: React.ComponentProps<"input"> & {
  value: number | null | undefined;
  size?: "sm" | "lg";
}) {
  return (
    <InputGroup>
      <InputGroupInput placeholder="Search..." value={value ?? ""} {...props} />
      <InputGroupAddon>
        <p className="text-muted-foreground select-none">E£</p>
      </InputGroupAddon>
    </InputGroup>
  );
}
