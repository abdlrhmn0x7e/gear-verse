import { headers } from "next/headers";
import { auth } from "~/server/auth";
import Header from "../../../components/header";
import {
  HomeIcon,
  PlusIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UsersIcon,
} from "lucide-react";
import SummaryCard from "../_components/summary-card";
import { Heading } from "~/components/heading";
import { QuickAction } from "../_components/quick-action";
import { api } from "~/trpc/server";
import type { RouterOutput } from "~/trpc/client";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import { OrdersTableHeader } from "../_components/tables/orders/header";
import { formatCurrency } from "~/lib/utils/format-currency";
import { OrderStatus } from "../_components/tables/orders/order-status";
import { formatDate } from "~/lib/utils/format-date";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "~/components/ui/frame";
import { PaymentMethod } from "~/components/payment-method";
import {
  IconArchive,
  IconShoppingBagPlus,
  IconShoppingBagSearch,
} from "@tabler/icons-react";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export default async function AdminPage() {
  const [session, userCount, ordersCount, lastOrders] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    api.admin.users.queries.getCount(),
    api.admin.orders.queries.getCount(),
    api.admin.orders.queries.getPage({ pageSize: 5 }),
  ]);

  return (
    <section className="space-y-6">
      <Header
        title={`Good Morning, ${session?.user.name}`}
        description="What would you like to do today?"
        Icon={HomeIcon}
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <SummaryCard
          title="Pending Orders"
          value={ordersCount.toString()}
          description="Get your ass to work, they're waiting for you!"
          Icon={ShoppingBagIcon}
        />

        <SummaryCard
          title="Total Customers"
          value={userCount.toString()}
          description="Total number of customers in the database"
          Icon={UsersIcon}
        />
      </div>

      <div className="space-y-3">
        <Heading level={3}>Quick Actions</Heading>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <QuickAction
            title="New Product"
            description="Add a new product to your store with details, images, and pricing."
            href="/admin/products/new"
            Icon={PlusIcon}
          />

          <QuickAction
            title="Show All Pending Orders"
            description="View and manage all orders that are currently pending fulfillment."
            href="/admin/orders?status=PENDING"
            Icon={IconShoppingBagSearch}
          />

          <QuickAction
            title="Create an Order"
            description="Manually create a new order for a customer or process a special transaction."
            href="/admin/orders?create=true"
            Icon={IconShoppingBagPlus}
          />

          <QuickAction
            title="Manage your Inventory"
            description="Track stock levels, update quantities, and manage product availability."
            href="/admin/inventory"
            Icon={IconArchive}
          />
        </div>
      </div>

      <Frame>
        <FrameHeader>
          <div className="flex items-center gap-2">
            <ShoppingCartIcon className="size-6" />
            <FrameTitle className="text-lg font-semibold">
              Last Orders
            </FrameTitle>
          </div>
          <FrameDescription>
            View the last 5 orders placed in your store.
          </FrameDescription>
        </FrameHeader>
        <FramePanel>
          <LastOrdersTable orders={lastOrders.data} />
        </FramePanel>
      </Frame>
    </section>
  );
}

function LastOrdersTable({
  orders,
}: {
  orders: RouterOutput["admin"]["orders"]["queries"]["getPage"]["data"];
}) {
  return (
    <Table>
      <OrdersTableHeader hideActions />

      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              <Button variant="link" asChild>
                <Link href={`/admin/orders?orderId=${order.id}`}>
                  # {order.id}
                </Link>
              </Button>
            </TableCell>
            <TableCell>{order.address}</TableCell>
            <TableCell>{formatCurrency(order.totalValue)}</TableCell>
            <TableCell>
              <OrderStatus status={order.status} />
            </TableCell>
            <TableCell>
              <PaymentMethod method={order.paymentMethod} />
            </TableCell>
            <TableCell>{formatDate(order.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
