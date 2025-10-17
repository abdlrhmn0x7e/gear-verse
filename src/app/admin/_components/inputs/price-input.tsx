import {
  InputGroup,
  InputGroupAddon,
  InputGroupNumberInput,
} from "~/components/ui/input-group";

export function PriceInput({
  value,
  step = 100,
  ...props
}: React.ComponentProps<typeof InputGroupNumberInput> & {
  value: number | null | undefined;
  size?: "sm" | "lg";
}) {
  return (
    <InputGroup>
      <InputGroupNumberInput value={value ?? ""} step={step} {...props} />
      <InputGroupAddon>
        <p className="text-muted-foreground select-none">E£</p>
      </InputGroupAddon>
    </InputGroup>
  );
}
