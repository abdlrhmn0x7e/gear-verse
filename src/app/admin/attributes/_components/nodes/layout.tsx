import { type Node, type NodeProps } from "@xyflow/react";

import { IconFolders } from "@tabler/icons-react";
import { Badge } from "~/components/ui/badge";

export function LayoutNode(props: NodeProps<Node<{ label: string }>>) {
  return (
    <div
      className="border-foreground relative rounded-lg border border-dashed"
      style={{
        height: props.height,
        width: props.width,
      }}
    >
      <Badge
        className="absolute -top-6 left-1/2 -translate-x-1/2 font-medium"
        variant="outline"
      >
        <IconFolders />
        {props.data.label}
      </Badge>
    </div>
  );
}
