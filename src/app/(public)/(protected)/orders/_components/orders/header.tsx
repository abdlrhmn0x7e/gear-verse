import { TableHead, TableHeader, TableRow } from "~/components/ui/table";

export function OrdersTableHeader() {
  return (
    <TableHeader>
      <TableRow className="sticky top-0 pb-1">
        <TableHead className="w-[200px]">Order ID</TableHead>
        <TableHead>Product</TableHead>
        <TableHead>Total Price</TableHead>
        <TableHead>Created At</TableHead>
        <TableHead className="w-[100px]"></TableHead>
      </TableRow>
    </TableHeader>
  );
}
