"use client";

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { useTRPC } from "~/trpc/client";
import { useAttributeStore } from "../_store/provider";
import { Heading } from "~/components/heading";
import { IconKeyframe } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Button } from "~/components/ui/button";
import { DiamondMinusIcon, PlusIcon } from "lucide-react";

export function AttributeValuesView() {
  const selectedAttribute = useAttributeStore(
    (state) => state.selectedAttribute,
  );
  return (
    <Card className="bg-background h-full p-1">
      <CardHeader className="p-0">
        <div className="bg-background flex w-full items-center justify-between gap-2 border-b p-4">
          <Heading level={4} className="flex items-center gap-2">
            <IconKeyframe />
            {selectedAttribute?.name ?? "No Attribute Selected"}{" "}
          </Heading>
          {selectedAttribute && <AddValueDialog id={selectedAttribute?.id} />}
        </div>
      </CardHeader>

      <CardContent className="h-full">
        <AttributeValues />
      </CardContent>
    </Card>
  );
}

function AttributeValues() {
  const trpc = useTRPC();
  const selectedAttribute = useAttributeStore(
    (state) => state.selectedAttribute,
  );
  const { data: values, isPending: valuesPending } = useQuery(
    trpc.admin.attributes.queries.getValues.queryOptions(
      {
        id: selectedAttribute?.id ?? 0,
      },
      {
        enabled: !!selectedAttribute,
      },
    ),
  );

  if (!selectedAttribute) {
    return (
      <Empty className="h-2/3">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <DiamondMinusIcon />
          </EmptyMedia>
          <EmptyTitle>No Attribute Selected</EmptyTitle>
          <EmptyDescription>
            Select an attribute to view it's values
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (valuesPending) {
    return <div>Loading values...</div>;
  }

  return <code>{JSON.stringify(values, null, 2)}</code>;
}

function AddValueDialog({ id }: { id: number | undefined }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusIcon />
          Add
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Attribute Value</DialogTitle>
          <DialogDescription>
            Add a new value to the selected attribute.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
