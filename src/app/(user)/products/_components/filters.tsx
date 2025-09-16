import { Heading } from "~/components/heading";
import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";

export function Filters({ className }: { className?: string }) {
  return (
    <aside id="filters" className={cn("sticky top-32 h-fit", className)}>
      <Card>
        <CardContent className="flex flex-col gap-8 divide-y [&>*:not(:last-child)]:pb-8">
          <div className="flex flex-col gap-4">
            <Heading level={4} font="default">
              Categories
            </Heading>
          </div>
          <div className="flex flex-col gap-4">
            <Heading level={4} font="default">
              Brands
            </Heading>
          </div>
          <div className="flex flex-col gap-4">
            <Heading level={4} font="default">
              Price
            </Heading>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
