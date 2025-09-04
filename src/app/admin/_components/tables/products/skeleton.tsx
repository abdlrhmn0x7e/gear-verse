import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { ProductsTableHeader } from "./header";
import { Skeleton } from "~/components/ui/skeleton";

export function ProductsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
