"use client";

import { TagIcon, TargetIcon } from "lucide-react";
import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { debounce } from "nuqs";
import { SearchInput } from "../../inputs/search-input";
import { useProductSearchParams } from "../../../_hooks/use-product-search-params";
import {
  useFilterQuery,
  type CommittedFilter,
} from "../../../_hooks/use-filter-query";
import {
  Filters,
  type FilterField,
  type FilterOption,
} from "~/components/reui/filters/filters";
import { useFlatCategories } from "~/hooks/use-flat-categories";
import { iconsMap } from "~/lib/icons-map";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/trpc/client";

// The server keeps a product when its brand (or category) is any of the
// picked ones, so that is the only condition either field offers.
const isAnyOf = [
  { value: "is_any_of", label: "is any of", arity: "many" },
] as const;

const BRANDS_PAGE_SIZE = 20;

function ids(filters: CommittedFilter[], field: string) {
  const value = filters.find((filter) => filter.field === field)?.value;
  const picked = (Array.isArray(value) ? value : [])
    .map(Number)
    .filter(Number.isInteger);
  return picked.length > 0 ? picked : null;
}

/**
 * Title search plus brand and category chips, all held in the products
 * search params.
 */
export function ProductsFilters({ className }: { className?: string }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useProductSearchParams();

  const { data: categories } = useQuery(
    trpc.admin.categories.queries.findAll.queryOptions(),
  );
  const flatCategories = useFlatCategories(categories ?? []);

  const fields = useMemo<FilterField<string | string[]>[]>(() => {
    // Brands come a page at a time, so the list loads more as it scrolls and
    // a search narrows each page as it arrives.
    const brandPage = (cursor?: string) =>
      queryClient.fetchQuery(
        trpc.admin.brands.queries.getPage.queryOptions({
          pageSize: BRANDS_PAGE_SIZE,
          cursor,
        }),
      );
    const brandOption = (brand: { id: number; name: string }) => ({
      value: brand.id.toString(),
      label: brand.name,
    });

    return [
      {
        id: "brands",
        label: "Brand",
        icon: <TargetIcon />,
        type: "select",
        operators: [...isAnyOf],
        placeholder: "Search brands...",
        loadOptions: async (query, { cursor }) => {
          const page = await brandPage(cursor);
          const needle = query.trim().toLowerCase();
          return {
            items: page.data
              .filter((brand) => brand.name.toLowerCase().includes(needle))
              .map(brandOption),
            nextCursor: page.nextCursor ?? undefined,
          };
        },
        // A chip restored from the URL knows only ids: walk the pages until
        // every picked brand has a name.
        resolveValues: async (values) => {
          const wanted = new Set(values);
          const found: FilterOption[] = [];
          let cursor: string | undefined;
          do {
            const page = await brandPage(cursor);
            for (const brand of page.data) {
              if (wanted.delete(brand.id.toString())) {
                found.push(brandOption(brand));
              }
            }
            cursor = page.nextCursor ?? undefined;
          } while (cursor && wanted.size > 0);
          return found;
        },
      },
      {
        id: "categories",
        label: "Category",
        icon: <TagIcon />,
        type: "select",
        operators: [...isAnyOf],
        placeholder: "Search categories...",
        options: flatCategories.map((category) => {
          const Icon = iconsMap.get(category.icon);
          const parents = category.path.slice(0, -1).map((step) => step.name);
          return {
            value: category.id.toString(),
            label: category.name,
            icon: Icon ? <Icon /> : undefined,
            description: parents.length ? parents.join(" › ") : undefined,
            keywords: parents,
          };
        }),
      },
    ];
  }, [flatCategories, queryClient, trpc]);

  const committed: CommittedFilter[] = [];
  if (filters.brands?.length) {
    committed.push({
      field: "brands",
      operator: "is_any_of",
      value: filters.brands.map(String),
    });
  }
  if (filters.categories?.length) {
    committed.push({
      field: "categories",
      operator: "is_any_of",
      value: filters.categories.map(String),
    });
  }

  const chips = useFilterQuery({
    fields,
    committed,
    onCommit: (next) =>
      void setFilters(
        { brands: ids(next, "brands"), categories: ids(next, "categories") },
        { limitUrlUpdates: debounce(500) },
      ),
  });

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;

    void setFilters(
      { title: value ? value : null },
      { limitUrlUpdates: debounce(500) },
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center",
        className,
      )}
    >
      <SearchInput
        className="w-full sm:max-w-xs"
        placeholder="Search by title"
        value={filters.title ?? ""}
        onChange={handleSearchChange}
      />
      <Filters
        fields={chips.fields}
        query={chips.query}
        onQueryChange={chips.onQueryChange}
        ruleMenu="remove"
        showClear
      />
    </div>
  );
}
