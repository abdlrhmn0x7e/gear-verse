"use client";

import {
  CoinsIcon,
  ListFilterIcon,
  SquareDashedIcon,
  TagIcon,
  TargetIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuPortal,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import { SearchInput } from "../../inputs/search-input";
import { cn } from "~/lib/utils";
import { useOrderSearchParams } from "~/app/admin/_hooks/use-order-search-params";
import { FilterList } from "../../filter-list";
import { OrderStatus } from "./order-status";
import { PaymentMethod } from "./payment-method";

export function OrdersFilter() {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useOrderSearchParams();

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    void setFilters({ ...filters, search: value ? Number(value) : null });
  }

  return (
    <div className="flex items-center gap-2">
      <SearchInput
        className="size-full max-w-sm"
        placeholder="Search by order ID"
        value={filters.search ?? ""}
        onChange={handleSearchChange}
      >
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger
            className={cn(
              "text-muted-foreground hover:text-primary cursor-pointer transition-colors focus-visible:outline-none",
              isOpen && "text-primary",
            )}
          >
            <ListFilterIcon size={16} />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-sm"
            sideOffset={16}
            alignOffset={-12}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <SquareDashedIcon className="mr-2 size-4" />
                  Status
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent sideOffset={8} alignOffset={-36}>
                    {(
                      [
                        "PENDING",
                        "SHIPPED",
                        "DELIVERED",
                        "REFUNDED",
                        "CANCELLED",
                      ] as const
                    ).map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => {
                          void setFilters({ ...filters, status });
                        }}
                      >
                        <OrderStatus variant="plain" status={status} />
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <CoinsIcon className="mr-2 size-4" />
                  Payment Method
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent sideOffset={8} alignOffset={-36}>
                    {(["COD"] as const).map((method) => (
                      <DropdownMenuItem
                        key={method}
                        onClick={() => {
                          void setFilters({
                            ...filters,
                            paymentMethod: method,
                          });
                        }}
                      >
                        <PaymentMethod method={method} variant="plain" />
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SearchInput>

      <FilterList
        loading={false}
        onRemove={({ key }) => {
          void setFilters({ ...filters, [key]: null });
        }}
        filters={[
          { key: "status", value: filters.status },
          { key: "paymentMethod", value: filters.paymentMethod },
        ]}
      />
    </div>
  );
}
