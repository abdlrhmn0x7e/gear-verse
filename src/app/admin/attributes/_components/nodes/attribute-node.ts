import type { RouterOutput } from "~/trpc/client";

type Attribute =
  RouterOutput["admin"]["attributes"]["queries"]["getAll"][number];

/** The edit and delete dialogs find an attribute's node by this id. */
export function attributeNodeId(id: number) {
  return `attribute-${id}`;
}

/** An attribute on the canvas, whether it was loaded or just added. */
export function attributeNode(attribute: Attribute, index: number) {
  return {
    id: attributeNodeId(attribute.id),
    position: { x: 0, y: index * 100 },
    type: "attribute" as const,
    data: attribute,
    // removing an attribute goes through its delete dialog, not Backspace
    deletable: false,
  };
}
