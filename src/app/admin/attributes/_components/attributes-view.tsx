"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Background,
  Handle,
  Position,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  type Node,
  type NodeProps,
  type OnConnect,
} from "@xyflow/react";
import { useCallback } from "react";
import { Card, CardContent } from "~/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useTRPC, type RouterOutput } from "~/trpc/client";

import "@xyflow/react/dist/style.css";

const nodeTypes = {
  attribute: AttributeNode,
  category: CategoryNode,
};

export function AttributesView() {
  const trpc = useTRPC();
  const { data: attributes } = useSuspenseQuery(
    trpc.admin.attributes.queries.getAll.queryOptions(),
  );
  const { data: categories } = useSuspenseQuery(
    trpc.admin.categories.queries.findAll.queryOptions({
      filters: { root: true },
    }),
  );
  console.log("attributes", attributes);
  console.log("categories", categories);
  const [nodes, setNodes, onNodesChange] = useNodesState([
    ...attributes.map((attribute, index) => ({
      id: attribute.id.toString(),
      position: { x: 0, y: 50 * index },
      type: "attribute",
      data: attribute,
    })),
    ...categories.map((category, index) => ({
      id: category.id.toString(),
      position: { x: 300, y: 50 * index },
      type: "category",
      data: category,
    })),
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        proOptions={{ hideAttribution: true }}
        fitView
      >
        <Background />
      </ReactFlow>
    </div>
  );
}

type Category =
  RouterOutput["admin"]["categories"]["queries"]["findAll"][number];
type CategoryNode = Node<Category, "category">;
function CategoryNode(props: NodeProps<CategoryNode>) {
  return (
    <Card className="ring-primary/50 bg-secondary dark:border-primary-foreground min-w-24 border-dashed py-1 text-center transition-shadow hover:ring-2">
      <CardContent>{props.data.name}</CardContent>
      <Handle type="target" position={Position.Left} />
    </Card>
  );
}

type Attribute =
  RouterOutput["admin"]["attributes"]["queries"]["getAll"][number];
type AttributeNode = Node<Attribute, "attribute">;
function AttributeNode(props: NodeProps<AttributeNode>) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Card className="ring-primary min-w-24 py-1 text-center transition-shadow hover:ring-1">
          <CardContent>{props.data.name}</CardContent>
          <Handle type="source" position={Position.Right} />
        </Card>
      </PopoverTrigger>
      <PopoverContent>hello?</PopoverContent>
    </Popover>
  );
}
