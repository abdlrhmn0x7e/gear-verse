import { TableHead, TableHeader, TableRow } from "~/components/ui/table";

export function ProductsTableHeader() {
  return (
    <TableHeader className="sticky top-0 pb-1">
      <TableRow>
        <TableHead className="w-[200px]">Product No.</TableHead>
        <TableHead>Product</TableHead>
        <TableHead>Brand</TableHead>
        <TableHead>Published</TableHead>
        <TableHead className="w-[100px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
