import { Heading } from "~/components/heading";
import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";

export function Filters({ className }: { className?: string }) {
  return (
    <aside
      id="filters"
      className={cn("sticky top-32 hidden h-fit lg:block", className)}
    >
      <Card>
        <CardContent className="flex flex-col gap-8 divide-y [&>*:not(:last-child)]:pb-8">
          <div className="flex flex-col gap-4">
            <Heading level={4}>Categories</Heading>
          </div>
          <div className="flex flex-col gap-4">
            <Heading level={4}>Brands</Heading>
          </div>
          <div className="flex flex-col gap-4">
            <Heading level={4}>Price</Heading>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
