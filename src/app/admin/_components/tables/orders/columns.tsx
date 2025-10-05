"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Button } from "~/components/ui/button";

import type { RouterOutputs } from "~/trpc/react";
import { OrderStatus } from "./order-status";
import { PaymentMethod } from "./payment-method";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export const ordersColumns: ColumnDef<
  RouterOutputs["admin"]["orders"]["queries"]["getPage"]["data"][number]
>[] = [
  {
    accessorKey: "id",
    header: "Order No.",
    cell: ({ row }) => {
      return (
        <Button variant="link" className="p-0" asChild>
          <Link href={`/admin/orders/${row.original.id}`}>
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
        <span className="capitalize">{row.original.address.toLowerCase()}</span>
      );
    },
  },

  {
    accessorKey: "totalValue",
    header: "Total Value",
    cell: ({ row }) => {
      return <span>{row.original.totalValue} EGP</span>;
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
  },

  {
    accessorKey: "createdAt",
    header: "Ordered At",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-4" />
          <span>{format(row.original.createdAt, "dd MMM, yyyy")}</span>
        </div>
      );
    },
  },
];
