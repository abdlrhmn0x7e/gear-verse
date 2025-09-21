import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { OrdersTableHeader } from "./header";
import { Skeleton } from "~/components/ui/skeleton";

export function OrdersTableSkeleton() {
  return (
    <div className="bg-background overflow-hidden rounded-md border">
      <Table containerClassName="scroll-shadow">
        <OrdersTableHeader />

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
  );
}
