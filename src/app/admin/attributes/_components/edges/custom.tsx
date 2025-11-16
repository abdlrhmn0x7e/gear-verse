import { useMutation } from "@tanstack/react-query";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  useReactFlow,
  type EdgeComponentProps,
} from "@xyflow/react";
import { useTRPC } from "~/trpc/client";

import { IconX } from "@tabler/icons-react";
import { Button } from "~/components/ui/button";

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
}: EdgeComponentProps) {
  const trpc = useTRPC();
  const { deleteElements } = useReactFlow();
  const [edgePath, labelX, labelY] = getStraightPath({
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
    void deleteElements({ edges: [{ id: id ?? "edge" }] });
  }

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <Button
          variant="destructive"
          size="icon-xs"
          className="size-4"
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
