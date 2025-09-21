import { Heading } from "~/components/heading";
import { ProductDescription } from "~/components/product-description";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { RouterOutputs } from "~/trpc/react";

export function ProductDetails({
  product,
}: {
  product: RouterOutputs["user"]["products"]["findBySlug"];
}) {
  return (
    <div className="space-y-8 divide-y [&>*:not(:last-child)]:pb-8">
      <div className="space-y-4">
        <Heading level={2}>Description</Heading>

        <ProductDescription description={product.description} className="m-0" />
      </div>

      <div className="space-y-4">
        <Heading level={2}>Specifications</Heading>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Specification</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(product.specifications).map(
                ([key, value], index) => (
                  <TableRow key={`${key}-${index}`}>
                    <TableCell>{key}</TableCell>
                    <TableCell>{value}</TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
