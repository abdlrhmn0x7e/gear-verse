"use client";

import { CreditCardIcon, HandCoinsIcon } from "lucide-react";
import { useOrderSearchParams } from "~/app/admin/_hooks/use-order-search-params";
import { FilterPill } from "../../filter-pill";
import { SearchInput } from "../../inputs/search-input";
import { orderStatuses, orderStatusMap } from "./order-status";

const paymentMethods = [
  { value: "COD", label: "Cash on Delivery", icon: <HandCoinsIcon /> },
  { value: "ONLINE", label: "Online Payment", icon: <CreditCardIcon /> },
] as const;

const statusOptions = orderStatuses.map((status) => ({
  value: status,
  label: orderStatusMap[status].label,
  icon: orderStatusMap[status].icon,
}));

/**
 * Phone number search plus status and payment method pills, all held in the
 * orders search params. Rendered straight into the page's toolbar row.
 */
export function OrdersFilters() {
  const [filters, setFilters] = useOrderSearchParams();

  return (
    <>
      <SearchInput
        className="w-full sm:w-64"
        placeholder="Search by phone number"
        aria-label="Search orders by phone number"
        value={filters.search ?? ""}
        onChange={(event) =>
          void setFilters({ search: event.target.value || null })
        }
      />
      <FilterPill
        label="Status"
        value={filters.status}
        options={statusOptions}
        onChange={(status) => void setFilters({ status })}
      />
      <FilterPill
        label="Payment"
        value={filters.paymentMethod}
        options={paymentMethods}
        onChange={(paymentMethod) => void setFilters({ paymentMethod })}
      />
    </>
  );
}
