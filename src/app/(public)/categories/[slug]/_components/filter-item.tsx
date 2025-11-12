import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";

export function FilterItem({ key, value }: { key: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={`category-${value}`} />
      <Label htmlFor={`category-${value}`}>{value}</Label>
    </div>
  );
}
