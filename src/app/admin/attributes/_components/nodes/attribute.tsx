import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
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

import { IconFrameOff, IconKeyframe, IconTrash } from "@tabler/icons-react";
import "@xyflow/react/dist/style.css";
import { DeleteDialog } from "~/components/delete-dialog";
import { Heading } from "~/components/heading";
import { Spinner } from "~/components/spinner";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { AttributeTypeBadge } from "../attribute-type-badge";
import { AddValueDialog } from "../dialogs/add-value-dialog";
import { DeleteAttributeAlertDialog } from "../dialogs/delete-attribute-dialog";
import { EditAttributeDialog } from "../dialogs/edit-attribute-dialog";
import type { AttributeType } from "~/lib/schemas/entities/attribute";

type Attribute =
  RouterOutput["admin"]["attributes"]["queries"]["getAll"][number];
type AttributeNode = Node<Attribute, "attribute">;

export function AttributeNode(props: NodeProps<AttributeNode>) {
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

        <AttributeValues attributeId={props.data.id} type={props.data.type} />
      </PopoverContent>
    </Popover>
  );
}

function AttributeValues({
  attributeId,
  type,
}: {
  attributeId: number;
  type: AttributeType;
}) {
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

  if (type === "BOOLEAN") {
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconFrameOff />
        </EmptyMedia>
        <EmptyTitle>This is a Boolean Filter</EmptyTitle>
        <EmptyDescription>
          You can't add values to a boolean it only has a true or false values
          dumbass
        </EmptyDescription>
      </EmptyHeader>
    </Empty>;
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
