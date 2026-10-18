import { type Node, type NodeProps } from "@xyflow/react";

import { IconFolders } from "@tabler/icons-react";
import { Badge } from "~/components/ui/badge";

export function LayoutNode(props: NodeProps<Node<{ label: string }>>) {
  return (
    <div
      // A container, not a node: a dashed edge round a faint fill.
      className="border-foreground/25 bg-foreground/[0.025] relative rounded-2xl border border-dashed"
      style={{
        height: props.height,
        width: props.width,
      }}
    >
      <Badge
        className="bg-background absolute -top-2.5 left-4 font-medium"
        variant="outline"
      >
        <IconFolders />
        {props.data.label}
      </Badge>
    </div>
  );
}
