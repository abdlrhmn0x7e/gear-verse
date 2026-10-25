"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "~/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { SearchIcon } from "lucide-react";
import { useRef, useState } from "react";
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
import { useCloseOnBack } from "~/hooks/use-close-on-back";
import { useDebounce } from "~/hooks/use-debounce";
import { useTRPC } from "~/trpc/client";
import {
  ProductSearchEmpty,
  ProductSearchError,
  ProductSearchItem,
  ProductSearchLoading,
} from "./product-search-dialog";

export function SearchDrawer() {
  const t = useTranslations("nav");
  const tSearch = useTranslations("products.search");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const navigateAway = useCloseOnBack(open, () => setOpen(false));
  const inputRef = useRef<HTMLInputElement>(null);
  const trpc = useTRPC();
  const locale = useLocale();
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
        locale,
      },
      // the drawer is mounted on every page, so search only once it opens
      { enabled: open },
    ),
  );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger
        render={<Button variant="ghost" size="icon-lg" className="lg:hidden" />}
      >
        <SearchIcon />
        <span className="sr-only">{t("searchProducts")}</span>
      </DrawerTrigger>
      {/* a fixed height rather than a min-height: the drawer caps itself above the keyboard when it opens, and a
          min-height would win and push its top off screen */}
      <DrawerContent
        className="h-[75svh]"
        // the drawer exists to type into, so its field takes focus rather than the panel
        initialFocus={inputRef}
      >
        <DrawerHeader>
          <DrawerTitle>{tSearch("title")}</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-4 px-4 pb-4">
          <InputGroup className="pointer-coarse:h-11">
            <InputGroupInput
              ref={inputRef}
              type="search"
              enterKeyHint="search"
              aria-label={tSearch("title")}
              placeholder={tSearch("drawerPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                // the keyboard's Search key shows everything that matches, as Enter does in the desktop dialog
                const query = search.trim();
                if (e.key !== "Enter" || !query) return;
                e.preventDefault();
                navigateAway();
                setOpen(false);
                router.push(`/products?title=${encodeURIComponent(query)}`);
              }}
              className="[&::-webkit-search-cancel-button]:appearance-none"
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
          {products?.data.length === 0 && (
            <ProductSearchEmpty query={debouncedSearch} />
          )}

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
