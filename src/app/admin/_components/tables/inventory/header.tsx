import { TableHead, TableHeader, TableRow } from "~/components/ui/table";

export function InventoryTableHeader() {
  return (
    <TableHeader className="sticky top-0 pb-1">
      <TableRow>
        <TableHead>Product</TableHead>
        <TableHead>Location</TableHead>
        <TableHead className="w-[200px]">Available</TableHead>
      </TableRow>
    </TableHeader>
  );
}
