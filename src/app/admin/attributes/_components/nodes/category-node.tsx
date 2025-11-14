"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { IconFolder } from "@tabler/icons-react";
import { Card, CardContent } from "~/components/ui/card";
import { iconsMap } from "~/lib/icons-map";
import type { RouterOutput } from "~/trpc/client";

type CategoryNodeData = RouterOutput["admin"]["categories"]["queries"]["findRoots"][number];

export function CategoryNode(props: NodeProps<Node<CategoryNodeData>>) {
  const Icon = props.data.icon ? iconsMap[props.data.icon] : IconFolder;

  return (
    <Card className="w-full">
      <CardContent className="flex items-center gap-1">
        <Icon className="size-4" />
        {props.data.name}
      </CardContent>
      <Handle type="target" position={Position.Left} />
    </Card>
  );
}
