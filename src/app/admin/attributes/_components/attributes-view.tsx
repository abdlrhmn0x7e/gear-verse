"use client";

import { useMutation, useSuspenseQueries } from "@tanstack/react-query";
import {
  Background,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  type Edge,
  type OnConnect,
  type OnEdgesDelete,
} from "@xyflow/react";
import { type CSSProperties, useCallback } from "react";
import { toast } from "~/components/ui/toast";
import { useTRPC } from "~/trpc/client";

import "@xyflow/react/dist/style.css";
import { CustomControls } from "./custom-controls";
import { AddAttributeDialog } from "./dialogs/add-attribute-dialog";
import { CustomEdge } from "./edges/custom";
import { AttributeNode } from "./nodes/attribute";
import { CategoryNode } from "./nodes/category";
import { LayoutNode } from "./nodes/layout";

const nodeTypes = {
  attribute: AttributeNode,
  category: CategoryNode,
  layout: LayoutNode,
};

const edgeTypes = {
  "custom-edge": CustomEdge,
};

// React Flow's own colours, swapped for the theme's so the canvas follows it.
const canvasTheme = {
  "--xy-edge-stroke":
    "color-mix(in oklab, var(--muted-foreground) 55%, transparent)",
  "--xy-edge-stroke-selected": "var(--primary)",
  "--xy-connectionline-stroke": "var(--primary)",
  "--xy-background-pattern-color": "var(--border)",
} as CSSProperties;

/** The record id at the end of a node id: `attribute-switch-type-1` is 1. */
function recordId(nodeId: string) {
  return Number(nodeId.split("-").pop());
}

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
  const { mutate: disconnect } = useMutation(
    trpc.admin.attributes.mutations.disconnect.mutationOptions(),
  );

  const [nodes, _, onNodesChange] = useNodesState([
    ...attributes.map((attribute, index) => ({
      id: `attribute-${attribute.slug}-${attribute.id}`,
      position: {
        x: 0,
        y: index * 100,
      },
      type: "attribute",
      data: attribute,
      deletable: false,
    })),

    {
      id: "categories-layout",
      position: { x: 500, y: 0 },
      type: "layout",
      data: { label: "Root Categories" },
      deletable: false,
      height: categories.length * 50 + 20,
      width: 225,
    },
    ...categories.map((category, index) => ({
      id: `category-${category.slug}-${category.id}`,
      position: { x: 10, y: 50 * index + 20 },
      type: "category",
      data: category,
      deletable: false,
      parentId: "categories-layout",
      extent: "parent" as const,
    })),
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    connections.map((conn) => ({
      id: `e-${conn.attribute.slug}-${conn.attribute.id}-${conn.category.slug}-${conn.category.id}`,
      source: `attribute-${conn.attribute.slug}-${conn.attribute.id}`,
      target: `category-${conn.category.slug}-${conn.category.id}`,
      type: "custom-edge",
    })),
  );
  const onConnect: OnConnect = useCallback(
    (params) => {
      const attributeId = recordId(params.source);
      const categoryId = recordId(params.target);

      if (!attributeId || !categoryId) {
        return;
      }

      connect(
        { attributeId, categoryId },
        {
          // take the line back off the canvas when the server refuses it
          onError: () => {
            setEdges((edgesSnapshot) =>
              edgesSnapshot.filter(
                (edge) =>
                  edge.source !== params.source ||
                  edge.target !== params.target,
              ),
            );
            toast.error("Couldn't connect the attribute. Try again.");
          },
        },
      );

      return setEdges((edgesSnapshot) =>
        addEdge({ ...params, type: "custom-edge" }, edgesSnapshot),
      );
    },
    [connect, setEdges],
  );

  // Every removal, from an edge's button or the Backspace key, lands here.
  const onEdgesDelete: OnEdgesDelete<Edge> = useCallback(
    (deleted) => {
      for (const edge of deleted) {
        const attributeId = recordId(edge.source);
        const categoryId = recordId(edge.target);

        if (!attributeId || !categoryId) continue;

        disconnect(
          { attributeId, categoryId },
          {
            // put the line back when the server keeps the connection
            onError: () => {
              setEdges((edgesSnapshot) => [...edgesSnapshot, edge]);
              toast.error("Couldn't remove the connection. Try again.");
            },
          },
        );
      }
    },
    [disconnect, setEdges],
  );

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        edgeTypes={edgeTypes}
        onEdgesChange={onEdgesChange}
        onEdgesDelete={onEdgesDelete}
        onConnect={onConnect}
        proOptions={{ hideAttribution: true }}
        style={canvasTheme}
        maxZoom={1.5}
        fitView
      >
        <Background gap={20} size={1.5} />

        <AddAttributeDialog
          className="bg-background absolute top-0 right-0 z-10"
          attributesLength={attributes.length}
        />

        <CustomControls />
      </ReactFlow>
    </div>
  );
}
