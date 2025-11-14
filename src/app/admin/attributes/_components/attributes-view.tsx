"use client";

import { useMutation, useSuspenseQueries } from "@tanstack/react-query";
import {
  Background,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  type OnConnect,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useCallback } from "react";
import { useTRPC } from "~/trpc/client";
import { CustomControls } from "./custom-controls";
import { AddAttributeDialog } from "./dialogs/add-attribute-dialog";
import { CustomEdge } from "./edges/custom-edge";
import { AttributeNode } from "./nodes/attribute-node";
import { CategoryNode } from "./nodes/category-node";
import { LayoutNode } from "./nodes/layout-node";

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
