"use client";

import { useQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";
import { Separator } from "~/components/ui/separator";
import { useDebounce } from "~/hooks/use-debounce";
import { useTRPC } from "~/trpc/client";
import {
  ProductSearchEmpty,
  ProductSearchError,
  ProductSearchItem,
  ProductSearchLoading,
} from "./product-search-dialog";

export function SearchDrawer() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [open, setOpen] = useState(false);
  const trpc = useTRPC();
  const {
    data: products,
    isPending: productsPending,
    isError: productsError,
  } = useQuery(
    trpc.public.products.queries.getPage.queryOptions({
      pageSize: 4,
      filters: {
        title: debouncedSearch,
      },
    }),
  );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="dark:bg-card bg-card w-1/2 justify-start md:w-1/3 lg:hidden"
        >
          <SearchIcon />
          Search...
        </Button>
      </DrawerTrigger>
      <DrawerContent className="min-h-[75svh]">
        <DrawerHeader>
          <DrawerTitle>Search Products</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-4 p-4">
          <InputGroup>
            <InputGroupInput
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>

          <Separator />

          {productsPending && <ProductSearchLoading />}
          {productsError && <ProductSearchError />}
          {products?.data.length === 0 && <ProductSearchEmpty />}

          {products && products.data.length > 0 && (
            <ul className="flex flex-col gap-2">
              {products.data.map((product, idx) => (
                <ProductSearchItem
                  key={`product-${product.id}-${idx}`}
                  product={product}
                  onClick={() => setOpen(false)}
                  hover={null}
                  index={idx}
                />
              ))}
            </ul>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
