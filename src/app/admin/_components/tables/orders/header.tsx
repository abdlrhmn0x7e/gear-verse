import { TableHead, TableHeader, TableRow } from "~/components/ui/table";

export function OrdersTableHeader() {
  return (
    <TableHeader>
      <TableRow className="sticky top-0 pb-1">
        <TableHead className="w-[200px]">Order No.</TableHead>
        <TableHead>Shipping Address</TableHead>
        <TableHead>Total Value</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Payment Method</TableHead>
        <TableHead>Ordered At</TableHead>
        <TableHead></TableHead>
      </TableRow>
    </TableHeader>
  );
}
