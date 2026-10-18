"use client";

import {
  CoinsIcon,
  CreditCardIcon,
  HandCoinsIcon,
  SquareDashedIcon,
} from "lucide-react";
import { useOrderSearchParams } from "~/app/admin/_hooks/use-order-search-params";
import {
  useFilterQuery,
  type CommittedFilter,
} from "~/app/admin/_hooks/use-filter-query";
import { Filters, type FilterField } from "~/components/reui/filters/filters";
import { SearchInput } from "../../inputs/search-input";
import { orderStatuses, orderStatusMap } from "./order-status";

const paymentMethods = [
  { value: "COD", label: "Cash on Delivery", icon: <HandCoinsIcon /> },
  { value: "ONLINE", label: "Online Payment", icon: <CreditCardIcon /> },
] as const;

// The server takes one status and one payment method, so "is" is the only
// condition either offers.
const is = [{ value: "is", label: "is" }];

const fields: FilterField<string | string[]>[] = [
  {
    id: "status",
    label: "Status",
    icon: <SquareDashedIcon />,
    type: "select",
    operators: is,
    searchable: false,
    options: orderStatuses.map((status) => ({
      value: status,
      label: orderStatusMap[status].label,
      icon: orderStatusMap[status].icon,
    })),
  },
  {
    id: "paymentMethod",
    label: "Payment",
    icon: <CoinsIcon />,
    type: "select",
    operators: is,
    searchable: false,
    options: paymentMethods.map((method) => ({ ...method })),
  },
];

function pick<T extends string>(
  filters: CommittedFilter[],
  field: string,
  allowed: readonly T[],
): T | null {
  const value = filters.find((filter) => filter.field === field)?.value;
  return allowed.find((item) => item === value) ?? null;
}

/**
 * Phone number search plus status and payment method chips, all held in the
 * orders search params. Rendered straight into the page's toolbar row.
 */
export function OrdersFilters() {
  const [filters, setFilters] = useOrderSearchParams();

  const committed: CommittedFilter[] = [];
  if (filters.status) {
    committed.push({ field: "status", operator: "is", value: filters.status });
  }
  if (filters.paymentMethod) {
    committed.push({
      field: "paymentMethod",
      operator: "is",
      value: filters.paymentMethod,
    });
  }

  const chips = useFilterQuery({
    fields,
    committed,
    onCommit: (next) =>
      void setFilters({
        status: pick(next, "status", orderStatuses),
        paymentMethod: pick(
          next,
          "paymentMethod",
          paymentMethods.map((method) => method.value),
        ),
      }),
  });

  return (
    <>
      <SearchInput
        className="w-full sm:w-72"
        placeholder="Search by phone number"
        aria-label="Search orders by phone number"
        value={filters.search ?? ""}
        onChange={(event) =>
          void setFilters({ search: event.target.value || null })
        }
      />
      <Filters
        fields={chips.fields}
        query={chips.query}
        onQueryChange={chips.onQueryChange}
        ruleMenu="remove"
        showClear
        // Takes the rest of the row so Clear sits on its far edge. A chip
        // reads as one phrase, so it wraps as a whole, never inside.
        className="min-w-0 flex-1 [&_[data-slot=filter-chip]]:whitespace-nowrap"
      />
    </>
  );
}
