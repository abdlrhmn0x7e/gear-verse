import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { InventoryTableHeader } from "./header";
import { Skeleton } from "~/components/ui/skeleton";

export function InventoryTableSkeleton() {
  return (
    <Table containerClassName="scroll-shadow">
      <InventoryTableHeader />

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
              <Skeleton className="h-4 w-[200px]" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
