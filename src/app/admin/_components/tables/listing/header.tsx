import { TableHead, TableHeader, TableRow } from "~/components/ui/table";

export function ListingsTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[200px]">Listing No.</TableHead>
        <TableHead>Title</TableHead>
        <TableHead>Price</TableHead>
        <TableHead>Stock</TableHead>
      </TableRow>
    </TableHeader>
  );
}
