import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  useNodesData,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";
import { useState } from "react";

import { XIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

/**
 * A connection between an attribute and a category. Its remove button stays
 * out of the way until the edge is hovered or selected, or the button itself
 * takes keyboard focus. Removing goes through React Flow, so the canvas's
 * `onEdgesDelete` disconnects it on the server like the Backspace key does.
 */
export function CustomEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  selected,
}: EdgeProps) {
  const { deleteElements } = useReactFlow();
  const [hovered, setHovered] = useState(false);
  const [attribute, category] = useNodesData([source, target]);
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const attributeName = (attribute?.data as { name?: string } | undefined)
    ?.name;
  const categoryName = (category?.data as { name?: string } | undefined)?.name;

  return (
    <>
      <BaseEdge id={id} path={edgePath} interactionWidth={0} />
      {/* a wider invisible line, so the edge is easy to hover */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="react-flow__edge-interaction"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan absolute"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
            // above the edges' hit paths
            zIndex: 50,
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            className={cn(
              "bg-popover text-muted-foreground hover:text-destructive relative size-5 rounded-full opacity-0 transition-opacity after:absolute after:-inset-1 focus:opacity-100 [&_svg:not([class*='size-'])]:size-3",
              (hovered || selected) && "opacity-100",
            )}
            aria-label={
              attributeName && categoryName
                ? `Remove ${attributeName} from ${categoryName}`
                : "Remove connection"
            }
            onClick={() => void deleteElements({ edges: [{ id }] })}
          >
            <XIcon />
          </Button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
