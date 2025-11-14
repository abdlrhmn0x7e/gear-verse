"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQueries,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  Background,
  BaseEdge,
  EdgeLabelRenderer,
  Handle,
  Position,
  ReactFlow,
  addEdge,
  getBezierPath,
  getSimpleBezierPath,
  getSmoothStepPath,
  getStraightPath,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type EdgeComponentProps,
  type Node,
  type NodeProps,
  type OnConnect,
} from "@xyflow/react";
import { useCallback } from "react";
import { Card, CardContent } from "~/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useTRPC, type RouterOutput } from "~/trpc/client";

import {
  IconDragDrop,
  IconFolder,
  IconFolders,
  IconFrameOff,
  IconHandMove,
  IconKeyframe,
  IconTrash,
  IconX,
  IconZoomIn,
  IconZoomOut,
} from "@tabler/icons-react";
import "@xyflow/react/dist/style.css";
import { DeleteDialog } from "~/components/delete-dialog";
import { Heading } from "~/components/heading";
import { Spinner } from "~/components/spinner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { AttributeTypeBadge } from "./attribute-type-badge";
import { AddAttributeDialog } from "./dialogs/add-attribute-dialog";
import { AddValueDialog } from "./dialogs/add-value-dialog";
import { DeleteAttributeAlertDialog } from "./dialogs/delete-attribute-dialog";
import { EditAttributeDialog } from "./dialogs/edit-attribute-dialog";
import { iconsMap } from "~/lib/icons-map";

const nodeTypes = {
  attribute: AttributeNode,
  category: CategoryNode,
  layout: LayoutNode,
};

const edgeTypes = {
  "custom-edge": CustomEdge,
};

export function AttributesView() {
  const trpc = useTRPC();
  const [{ data: categories }, { data: attributes }, { data: connections }] =
    useSuspenseQueries({
      queries: [
        trpc.admin.categories.queries.findRoots.queryOptions(),
        trpc.admin.attributes.queries.getAll.queryOptions(),
        trpc.admin.attributes.queries.getAllConnections.queryOptions(),
      ],
    });
  const { mutate: connect } = useMutation(
    trpc.admin.attributes.mutations.connect.mutationOptions(),
  );

  const [nodes, _, onNodesChange] = useNodesState([
    ...attributes.map((attribute, index) => ({
      id: `attribute-${attribute.slug}-${attribute.id}`,
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
      id: `category-${category.slug}-${category.id}`,
      position: { x: 10, y: 50 * index + 20 },
      type: "category",
      data: category,
      parentId: "categories-layout",
      extent: "parent" as const,
    })),
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    connections.map((conn) => ({
      id: `e-${conn.attribute.slug}-${conn.attribute.id}-${conn.category.slug}-${conn.category.id}`,
      source: `attribute-${conn.attribute.slug}-${conn.attribute.id}`,
      target: `category-${conn.category.slug}-${conn.category.id}`,
      type: "custom-edge",
    })),
  );
  const onConnect: OnConnect = useCallback((params) => {
    const attributeId = parseInt(params.source!.split("-").pop()!);
    const categoryId = parseInt(params.target!.split("-").pop()!);

    if (!attributeId || !categoryId) {
      return;
    }

    connect({
      attributeId,
      categoryId,
    });

    return setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot));
  }, []);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        edgeTypes={edgeTypes}
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
    <Card className="bg-background/80 absolute bottom-0 left-0 z-10 w-10 cursor-help overflow-hidden p-1 shadow-lg backdrop-blur-md transition-[width] duration-300 hover:w-auto">
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
  RouterOutput["admin"]["categories"]["queries"]["findRoots"][number];
type CategoryNode = Node<Category, "category">;
function CategoryNode(props: NodeProps<CategoryNode>) {
  const Icon = iconsMap.get(props.data.icon) || IconFolder;

  return (
    <Card className="ring-primary/50 bg-secondary dark:border-primary-foreground min-w-24 border-dashed py-1 text-center transition-shadow hover:ring-2">
      <CardContent className="flex items-center gap-1">
        <Icon className="size-4" />
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

      <PopoverContent className="min-w-96 space-y-4" align="start">
        <div className="flex justify-between gap-4">
          <Heading level={5}>Attribute Values</Heading>
          <AddValueDialog attributeId={props.data.id} />
        </div>

        <AttributeValues attributeId={props.data.id} />
      </PopoverContent>
    </Popover>
  );
}

function AttributeValues({ attributeId }: { attributeId: number }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: attributeValues, isPending: attributeValuesPending } = useQuery(
    trpc.admin.attributeValues.queries.findAll.queryOptions({
      attributeId,
    }),
  );
  const { mutate: deleteAttributeValue, isPending: deletingAttributeValue } =
    useMutation(
      trpc.admin.attributeValues.mutations.delete.mutationOptions({
        onSuccess: () => {
          void queryClient.invalidateQueries(
            trpc.admin.attributeValues.queries.findAll.queryFilter(),
          );
        },
      }),
    );

  if (attributeValuesPending) {
    return (
      <div className="flex h-full min-h-58 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!attributeValues || attributeValues.length === 0) {
    return (
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
    );
  }

  return (
    <ul className="min-h-58 space-y-1">
      {attributeValues.map((value) => (
        <li
          key={value.id}
          className="bg-background flex items-center justify-between rounded-md border px-2 py-1"
        >
          <p className="text-muted-foreground text-sm font-medium">
            {value.value}
          </p>

          <DeleteDialog
            entity="attribute value"
            handleDelete={() => deleteAttributeValue({ id: value.id })}
            disabled={deletingAttributeValue}
            Trigger={
              <Button
                variant="destructive-ghost"
                size="icon"
                disabled={deletingAttributeValue}
              >
                <IconTrash />
              </Button>
            }
          />
        </li>
      ))}
    </ul>
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

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
}: EdgeComponentProps) {
  const trpc = useTRPC();
  const { deleteElements } = useReactFlow();
  const [edgePath, labelX, labelY] = getSimpleBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });
  const { mutate: disconnect } = useMutation(
    trpc.admin.attributes.mutations.disconnect.mutationOptions(),
  );

  function handleDelete() {
    const attributeId = Number(id?.split("-")?.[2]);
    const categoryId = Number(id?.split("-")?.[4]);

    if (!attributeId || !categoryId) {
      return;
    }

    disconnect({
      attributeId,
      categoryId,
    });
    deleteElements({ edges: [{ id: id ?? "edge" }] });
  }

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <Button
          variant="default"
          size="icon-xs"
          onClick={handleDelete}
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            zIndex: 50,
            pointerEvents: "all",
          }}
        >
          <IconX />
        </Button>
      </EdgeLabelRenderer>
    </>
  );
}
