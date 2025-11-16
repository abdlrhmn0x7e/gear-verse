import { CheckIcon, CheckCheckIcon, ToggleRightIcon } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import type { AttributeType } from "~/lib/schemas/entities/attribute";

export function AttributeTypeBadge({ type }: { type: AttributeType }) {
  switch (type) {
    case "SELECT":
      return (
        <Badge variant="success">
          <CheckIcon /> Select
        </Badge>
      );
    case "MULTISELECT":
      return (
        <Badge variant="secondary">
          <CheckCheckIcon /> Multi Select
        </Badge>
      );

    case "BOOLEAN":
      return (
        <Badge variant="default">
          <ToggleRightIcon /> Boolean
        </Badge>
      );
    default:
      return null;
  }
}
