"use client";

import { CoinsIcon, ListFilterIcon, SquareDashedIcon } from "lucide-react";
import { useState } from "react";
import { useOrderSearchParams } from "~/app/admin/_hooks/use-order-search-params";
import { PaymentMethod } from "~/components/payment-method";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import { FilterList } from "../../filter-list";
import { SearchInput } from "../../inputs/search-input";
import { OrderStatus } from "./order-status";

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
        className="max-w-sm"
        placeholder="Search by order ID"
        value={filters.search ?? ""}
        onChange={handleSearchChange}
      >
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger
            className={cn(isOpen && "dark:text-primary-foreground")}
            asChild
          >
            <Button variant="ghost" size="icon-sm">
              <ListFilterIcon />
            </Button>
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
