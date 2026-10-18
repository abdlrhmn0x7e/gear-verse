import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { type RouterOutput } from "~/trpc/client";

import { IconFolder } from "@tabler/icons-react";
import { iconsMap } from "~/lib/icons-map";
import { cn } from "~/lib/utils";
import { nodeHandle, nodeSurface } from "./styles";

type Category =
  RouterOutput["admin"]["categories"]["queries"]["findRoots"][number];
type CategoryNode = Node<Category, "category">;
export function CategoryNode(props: NodeProps<CategoryNode>) {
  const Icon = iconsMap.get(props.data.icon) ?? IconFolder;

  return (
    <div
      className={cn(
        nodeSurface,
        "group hover:ring-primary/40 dark:hover:ring-primary/40 flex w-[205px] items-center gap-2 px-3 py-2 text-sm font-medium transition-shadow",
      )}
    >
      {/*eslint-disable-next-line react-hooks/static-components*/}
      <Icon className="text-muted-foreground size-4 shrink-0" />
      <span className="truncate">{props.data.name}</span>
      <Handle type="target" position={Position.Left} className={nodeHandle} />
    </div>
  );
}
