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
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";

import {
  IconDragDrop,
  IconFolder,
  IconFolders,
  IconFrameOff,
  IconHandMove,
  IconKeyframe,
  IconZoomIn,
  IconZoomOut,
} from "@tabler/icons-react";
import "@xyflow/react/dist/style.css";
import { Heading } from "~/components/heading";
import { Badge } from "~/components/ui/badge";
import { AddAttributeDialog } from "./add-attribute-dialog";
import { DeleteAttributeAlertDialog } from "./delete-attribute-dialog";
import { EditAttributeDialog } from "./edit-attribute-dialog";
import { AttributeTypeBadge } from "./attribute-type-badge";
import { AddValueDialog } from "./add-value-dialog";

const nodeTypes = {
  attribute: AttributeNode,
  category: CategoryNode,
  layout: LayoutNode,
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
  const [nodes, _, onNodesChange] = useNodesState([
    ...attributes.map((attribute, index) => ({
      id: attribute.slug,
      position: {
        x: 0,
        y: index * 50,
      },
      type: "attribute",
      data: attribute,
    })),

    {
      id: "categories-layout",
      position: { x: 500, y: 0 },
      type: "layout",
      data: { label: "Root Categories" },
      height: categories.length * 50 + 20,
      width: 225,
    },
    ...categories.map((category, index) => ({
      id: category.id.toString(),
      position: { x: 10, y: 50 * index + 20 },
      type: "category",
      data: category,
      parentId: "categories-layout",
      extent: "parent" as const,
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
        maxZoom={1.5}
        fitView
      >
        <Background />

        <AddAttributeDialog
          className="bg-background absolute top-0 right-0 z-10"
          attributesLength={attributes.length}
        />

        <CustomControls />
      </ReactFlow>
    </div>
  );
}

const CONTROLS = [
  {
    label: "Scroll Up To Zoom In",
    icon: IconZoomIn,
  },
  {
    label: "Scroll Down To Zoom Out",
    icon: IconZoomOut,
  },
  {
    label: "Drag To Pan Around",
    icon: IconHandMove,
  },

  {
    label: "Shift + Drag To Select Multiple",
    icon: IconDragDrop,
  },
];

function CustomControls() {
  return (
    <Card className="bg-background/80 absolute bottom-0 left-0 z-10 w-10 overflow-hidden p-1 shadow-lg backdrop-blur-md transition-[width] duration-300 hover:w-auto">
      <CardContent className="p-0">
        <ul>
          {CONTROLS.map(({ label, icon: Icon }) => (
            <li key={label} className="flex items-center gap-2 p-2">
              <Icon className="size-4 shrink-0" />
              <span className="truncate text-sm font-medium">{label}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

type Category =
  RouterOutput["admin"]["categories"]["queries"]["findAll"][number];
type CategoryNode = Node<Category, "category">;
function CategoryNode(props: NodeProps<CategoryNode>) {
  return (
    <Card className="ring-primary/50 bg-secondary dark:border-primary-foreground min-w-24 border-dashed py-1 text-center transition-shadow hover:ring-2">
      <CardContent className="flex items-center gap-1">
        <IconFolder className="size-4" />
        {props.data.name}
      </CardContent>
      <Handle type="target" position={Position.Left} />
    </Card>
  );
}

type Attribute =
  RouterOutput["admin"]["attributes"]["queries"]["getAll"][number];
type AttributeNode = Node<Attribute, "attribute">;
function AttributeNode(props: NodeProps<AttributeNode>) {
  const trpc = useTRPC();
  const { data: attributeValues } = useSuspenseQuery(
    trpc.admin.attributes.queries.getValues.queryOptions({ id: props.data.id }),
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Card className="group ring-primary relative min-w-24 py-1 text-center transition-shadow hover:ring-1">
          <Badge
            onClick={(e) => e.stopPropagation()}
            className="absolute -top-7 left-1/2 max-h-6 -translate-x-1/2 px-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100"
            variant="outline"
          >
            <EditAttributeDialog attribute={props.data} />
            <DeleteAttributeAlertDialog
              id={props.data.id}
              slug={props.data.slug}
            />
          </Badge>
          <CardContent className="flex items-center gap-1">
            <IconKeyframe className="size-4" />
            {props.data.name}
            <AttributeTypeBadge type={props.data.type} />
          </CardContent>
          <Handle type="source" position={Position.Right} />
        </Card>
      </PopoverTrigger>
      <PopoverContent className="min-w-96" align="start">
        <div className="flex justify-between gap-4">
          <Heading level={5}>Attribute Values</Heading>
          <AddValueDialog attributeId={props.data.id} />
        </div>

        {!attributeValues || attributeValues.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconFrameOff />
              </EmptyMedia>
              <EmptyTitle>No Values</EmptyTitle>
              <EmptyDescription>
                Add some values to get started dumbass
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
            {attributeValues.map((value) => (
              <li
                key={value.id}
                className="bg-background flex items-center justify-between rounded-md border px-3 py-2"
              >
                {value.value}
                <div></div>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

function LayoutNode(props: NodeProps<Node<{ label: string }>>) {
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
