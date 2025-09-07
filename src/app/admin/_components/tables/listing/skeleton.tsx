"use client";

import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { ListingsTableHeader } from "./header";
import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { useListingSearchParams } from "../../../_hooks/use-listing-search-params";
import { SearchInput } from "../../inputs/search-input";

export function ListingsTableSkeleton() {
  const [params] = useListingSearchParams();

  return (
    <Card className="gap-1 py-2">
      <CardHeader className="px-2">
        <SearchInput
          className="max-w-sm"
          defaultValue={params.title ?? ""}
          disabled
        />
      </CardHeader>

      <CardContent className="px-2">
        <div className="bg-background overflow-hidden rounded-md border">
          <Table containerClassName="scroll-shadow">
            <ListingsTableHeader />

            <TableBody>
              {Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
