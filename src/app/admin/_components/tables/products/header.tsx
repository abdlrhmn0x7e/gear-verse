import { TableHead, TableHeader, TableRow } from "~/components/ui/table";

export function ProductsTableHeader() {
  return (
    <TableHeader>
      <TableRow className="sticky top-0 pb-1">
        <TableHead className="w-[200px]">Product No.</TableHead>
        <TableHead>Product Name</TableHead>
        <TableHead>Brand</TableHead>
        <TableHead>Created At</TableHead>
      </TableRow>
    </TableHeader>
  );
}
