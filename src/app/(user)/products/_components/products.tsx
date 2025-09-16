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
import { api } from "~/trpc/server";
import { ProductList } from "./product-list";
import { Suspense } from "react";

export function Products({ className }: { className?: string }) {
  void api.user.products.getPage.prefetchInfinite({
    pageSize: 9,
  });

  return (
    <section id="products" className={cn("mt-2 space-y-8", className)}>
      <div className="flex items-center justify-between">
        <Heading level={3} font="default">
          All Products
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

      <Suspense fallback={<div>Loading...</div>}>
        <ProductList />
      </Suspense>
    </section>
  );
}
