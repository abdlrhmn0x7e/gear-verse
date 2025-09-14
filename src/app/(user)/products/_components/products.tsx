import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  SkullIcon,
  SparklesIcon,
} from "lucide-react";
import { Heading } from "~/components/heading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";

export function Products({ className }: { className?: string }) {
  return (
    <section id="products" className={cn("mt-2", className)}>
      <div className="flex items-center justify-between">
        <Heading level={3} font="default">
          All products
        </Heading>

        <Select defaultValue="default">
          <SelectTrigger className="w-full max-w-3xs">
            <SelectValue
              placeholder={
                <>
                  <ArrowUpDownIcon /> Sort by...
                </>
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">
              <ArrowUpDownIcon />
              Default
            </SelectItem>
            <SelectItem value="newest">
              <SparklesIcon />
              Newest
            </SelectItem>
            <SelectItem value="oldest">
              <SkullIcon />
              Oldest
            </SelectItem>
            <SelectItem value="price-asc">
              <ArrowUpIcon />
              Price: Low to High
            </SelectItem>
            <SelectItem value="price-desc">
              <ArrowDownIcon />
              Price: High to Low
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
