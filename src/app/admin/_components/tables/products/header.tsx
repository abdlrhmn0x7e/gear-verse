import { TableHead, TableHeader, TableRow } from "~/components/ui/table";

export function ProductsTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[220px]">Product No.</TableHead>
        <TableHead>Title</TableHead>
        <TableHead>Created At</TableHead>
      </TableRow>
    </TableHeader>
  );
}
