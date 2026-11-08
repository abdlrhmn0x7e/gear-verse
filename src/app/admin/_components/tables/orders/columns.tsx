"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";

import type { RouterOutput } from "~/trpc/client";
import { OrderStatus } from "./order-status";
import { PaymentMethod } from "~/components/payment-method";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "~/lib/utils/format-currency";
import { OrdersTableActions } from "./actions";
import type { ListColumn } from "../list-grid";
import {
  formatAddressLine,
  formatGovernorate,
} from "~/app/admin/(index)/_components/format";

export type OrderRow =
  RouterOutput["admin"]["orders"]["queries"]["getPage"]["data"][number];

export const ordersColumns: ListColumn<OrderRow>[] = [
  {
    accessorKey: "id",
    header: "Order No.",
    cell: ({ row }) => {
      return (
        // A real link, so the order can open in a new tab; the row itself
        // opens the order drawer.
        <Button
          variant="link"
          className="h-auto p-0"
          nativeButton={false}
          render={
            <Link
              href={`/admin/orders?orderId=${row.original.id}`}
              onClick={(event) => event.stopPropagation()}
            />
          }
        >
          # {row.original.id}
        </Button>
      );
    },
  },

  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => {
      return (
        <div className="flex max-w-56 min-w-0 flex-col">
          <span className="truncate" title={row.original.customerName ?? ""}>
            {row.original.customerName}
          </span>
          <span className="text-muted-foreground truncate text-xs tabular-nums">
            {row.original.phoneNumber}
          </span>
        </div>
      );
    },
  },

  {
    id: "address",
    header: "Address",
    cell: ({ row }) => {
      const parts = row.original.addressParts;
      const area = parts
        ? `${parts.city}, ${formatGovernorate(parts.governorate)}`
        : "";
      return (
        <span className="block max-w-72 truncate" title={area}>
          {area}
        </span>
      );
    },
    meta: {
      headerClassName: "hidden md:table-cell w-full",
      cellClassName: "hidden md:table-cell",
    },
  },

  {
    accessorKey: "itemCount",
    header: "Items",
    cell: ({ row }) => {
      return <span>{row.original.itemCount}</span>;
    },
    meta: {
      headerClassName: "hidden lg:table-cell text-right",
      cellClassName: "hidden lg:table-cell text-right tabular-nums",
    },
  },

  {
    accessorKey: "totalValue",
    header: "Total",
    cell: ({ row }) => {
      return <span>{formatCurrency(row.original.totalValue, "en")}</span>;
    },
    meta: {
      headerClassName: "text-right",
      cellClassName: "text-right tabular-nums",
    },
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return <OrderStatus status={row.original.status} />;
    },
  },

  {
    accessorKey: "paymentMethod",
    header: "Payment",
    cell: ({ row }) => {
      return <PaymentMethod method={row.original.paymentMethod} />;
    },
    meta: {
      headerClassName: "hidden sm:table-cell",
      cellClassName: "hidden sm:table-cell",
    },
  },

  {
    accessorKey: "createdAt",
    header: "Ordered At",
    cell: ({ row }) => {
      return (
        <div className="text-muted-foreground flex items-center gap-2 tabular-nums">
          <CalendarIcon className="size-4" />
          <span>{format(row.original.createdAt, "dd MMM, HH:mm")}</span>
        </div>
      );
    },
    meta: {
      headerClassName: "hidden lg:table-cell",
      cellClassName: "hidden lg:table-cell",
    },
  },

  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      return (
        // The menu portals out, but the trigger's click would still open the
        // row's drawer.
        <div onClick={(event) => event.stopPropagation()}>
          <OrdersTableActions
            id={row.original.id}
            phoneNumber={row.original.phoneNumber}
            addressLine={formatAddressLine(row.original.addressParts)}
          />
        </div>
      );
    },
    meta: { headerTitle: "Actions", cellClassName: "text-right" },
  },
];
