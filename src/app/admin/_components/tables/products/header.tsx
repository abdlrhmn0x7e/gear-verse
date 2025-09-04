import { TableHead, TableHeader, TableRow } from "~/components/ui/table";

export function ProductsTableHeader() {
  return (
    <TableHeader>
      <TableRow className="sticky top-0 pb-1">
        <TableHead className="w-[220px]">Product No.</TableHead>
        <TableHead>Title</TableHead>
        <TableHead>Created At</TableHead>
      </TableRow>
    </TableHeader>
  );
}
