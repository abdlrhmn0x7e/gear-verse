"use client";

import { useQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerBody,
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
    trpc.public.products.queries.getPage.queryOptions(
      {
        pageSize: 4,
        filters: {
          title: debouncedSearch,
        },
      },
      // the drawer is mounted on every page, so search only once it opens
      { enabled: open },
    ),
  );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon-lg" className="lg:hidden">
          <SearchIcon />
          <span className="sr-only">Search products</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="min-h-[75svh]">
        <DrawerHeader>
          <DrawerTitle>Search products</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-4 px-4 pb-4">
          <InputGroup>
            <InputGroupInput
              aria-label="Search products"
              placeholder="Keyboards, mice, IEMs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>

          <Separator />
        </div>

        {/* the field stays put while the results scroll under it */}
        <DrawerBody>
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
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
