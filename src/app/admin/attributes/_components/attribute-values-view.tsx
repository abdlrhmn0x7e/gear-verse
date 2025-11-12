"use client";

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { useTRPC } from "~/trpc/client";
import { useAttributeStore } from "../_store/provider";
import { Heading } from "~/components/heading";
import { IconCategoryPlus, IconKeyframe } from "@tabler/icons-react";
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
import { DiamondMinusIcon, DiamondPlusIcon, PlusIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export function AttributeValuesView() {
  const selectedAttribute = useAttributeStore(
    (state) => state.selectedAttribute,
  );
  return (
    <Card className="bg-background h-full gap-1 p-1">
      <CardHeader className="p-0">
        <div className="bg-background flex w-full items-center justify-between gap-2 border-b p-4">
          <Heading level={4} className="flex items-center gap-2">
            <IconKeyframe />
            {selectedAttribute?.name ?? "No Attribute Selected"}{" "}
          </Heading>
          {selectedAttribute && <AddValueDialog id={selectedAttribute?.id} />}
        </div>
      </CardHeader>

      <CardContent className="h-full p-0">
        <Tabs>
          <TabsList className="w-full border md:w-fit">
            <TabsTrigger value="values">
              <DiamondPlusIcon />
              Values
            </TabsTrigger>
            <TabsTrigger value="categories">
              <IconCategoryPlus />
              Categories
            </TabsTrigger>
          </TabsList>

          <div className="h-full px-2">
            <TabsContent value="values">
              <AttributeValues />
            </TabsContent>
          </div>
        </Tabs>
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

  if (!values || values.length === 0) {
    return (
      <Empty className="h-2/3">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <DiamondMinusIcon />
          </EmptyMedia>
          <EmptyTitle>No Values Found</EmptyTitle>
          <EmptyDescription>
            No values were found for this attribute. Add some values to get
            started.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Value</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {values.map((value) => (
          <TableRow>
            <TableCell>{value.value}</TableCell>
            <TableCell></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
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
