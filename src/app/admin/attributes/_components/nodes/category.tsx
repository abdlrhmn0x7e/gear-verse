import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Card, CardContent } from "~/components/ui/card";
import { type RouterOutput } from "~/trpc/client";

import { IconFolder } from "@tabler/icons-react";
import { iconsMap } from "~/lib/icons-map";

type Category =
  RouterOutput["admin"]["categories"]["queries"]["findRoots"][number];
type CategoryNode = Node<Category, "category">;
export function CategoryNode(props: NodeProps<CategoryNode>) {
  const Icon = iconsMap.get(props.data.icon) ?? IconFolder;

  return (
    <Card className="ring-primary/50 bg-secondary dark:border-primary-foreground min-w-24 border-dashed py-1 text-center transition-shadow hover:ring-2">
      <CardContent className="flex items-center gap-1">
        {/*eslint-disable-next-line react-hooks/static-components*/}
        <Icon className="size-4" />
        {props.data.name}
      </CardContent>
      <Handle type="target" position={Position.Left} />
    </Card>
  );
}
