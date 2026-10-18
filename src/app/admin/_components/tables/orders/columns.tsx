"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";

import type { RouterOutput } from "~/trpc/client";
import { OrderStatus } from "./order-status";
import { PaymentMethod } from "~/components/payment-method";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { OrdersTableActions } from "./actions";
import type { ListColumn } from "../list-grid";

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
        <Button variant="link" className="h-auto p-0" asChild>
          <Link
            href={`/admin/orders/${row.original.id}`}
            onClick={(event) => event.stopPropagation()}
          >
            # {row.original.id}
          </Link>
        </Button>
      );
    },
  },

  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => {
      return (
        <span
          className="block max-w-72 truncate capitalize"
          title={row.original.address}
        >
          {row.original.address.toLowerCase()}
        </span>
      );
    },
    meta: {
      headerClassName: "hidden md:table-cell w-full",
      cellClassName: "hidden md:table-cell",
    },
  },

  {
    accessorKey: "totalValue",
    header: "Total Value",
    cell: ({ row }) => {
      return <span>{row.original.totalValue} EGP</span>;
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
    header: "Payment Method",
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
          <span>{format(row.original.createdAt, "dd MMM, yyyy")}</span>
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
          <OrdersTableActions id={row.original.id} />
        </div>
      );
    },
    meta: { headerTitle: "Actions", cellClassName: "text-right" },
  },
];
