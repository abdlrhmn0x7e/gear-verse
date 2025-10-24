"use client";

import { type ColumnDef } from "@tanstack/react-table";

import type { RouterOutput } from "~/trpc/client";
import { formatCurrency } from "~/lib/utils/format-currency";
import { CalendarIcon, EyeIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "~/components/ui/button";
import { PaymentMethod } from "../../../_components/payment-method";

export const ordersColumns: ColumnDef<
  RouterOutput["public"]["orders"]["queries"]["getPage"]["data"][number]
>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => {
      return <Button variant="link"># {row.original.id}</Button>;
    },
  },
  {
    accessorKey: "paymentMethod",
    cell: ({ row }) => {
      return <PaymentMethod paymentMethod={row.original.paymentMethod} />;
    },
  },
  {
    accessorKey: "totalPrice",
    cell: ({ row }) => {
      return <p>{formatCurrency(row.original.totalPrice)}</p>;
    },
  },
  {
    accessorKey: "createdAt",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-4" />
          <p>{format(row.original.createdAt, "MMM d, yyyy")}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "actions",
    cell: () => {
      return (
        <Button variant="ghost">
          <EyeIcon className="size-4" />
          View Details
        </Button>
      );
    },
  },
];
