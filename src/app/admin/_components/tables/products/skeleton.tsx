"use client";

import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { ProductsTableHeader } from "./header";
import { Skeleton } from "~/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { SearchInput } from "../../inputs/search-input";
import { ListFilterIcon } from "lucide-react";
import { useProductSearchParams } from "../../../_hooks/use-product-search-params";
import { Button } from "~/components/ui/button";

export function ProductsTableSkeleton() {
  const [filters] = useProductSearchParams();

  return (
    <Card className="gap-1 py-2">
      <CardHeader className="px-2">
        <SearchInput
          className="max-w-sm"
          disabled
          defaultValue={filters.title ?? ""}
        >
          <Button variant="ghost" size="icon-sm">
            <ListFilterIcon />
          </Button>
        </SearchInput>
      </CardHeader>

      <CardContent className="px-2">
        <div className="bg-background overflow-hidden rounded-md border">
          <Table containerClassName="scroll-shadow">
            <ProductsTableHeader />

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
