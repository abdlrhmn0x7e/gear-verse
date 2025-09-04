import { headers } from "next/headers";
import { auth } from "~/server/auth";
import PageHeader from "../_components/page-header";
import {
  HomeIcon,
  PackageIcon,
  PlusIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UsersIcon,
} from "lucide-react";
import SummaryCard from "../_components/summary-card";
import { Heading } from "~/components/heading";
import { QuickAction } from "../_components/quick-action";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <section className="space-y-6">
      <PageHeader
        title={`Good Morning, ${session?.user.name}`}
        description="What would you like to do today?"
        Icon={HomeIcon}
      />

      <div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <SummaryCard
            title="Total Products"
            value="100"
            description="Total number of products in the database"
            Icon={PackageIcon}
          />

          <SummaryCard
            title="Pending Orders"
            value="100"
            description="Get your ass to work, they're waiting for you!"
            Icon={ShoppingBagIcon}
          />

          <SummaryCard
            title="Total Customers"
            value="100"
            description="Total number of customers in the database"
            Icon={UsersIcon}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Heading level={3}>Quick Actions</Heading>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <QuickAction
            title="New Product"
            description="Create a new product to add to your store."
            Icon={PlusIcon}
          />
          <QuickAction
            title="New Listing"
            description="Publish a new listing to your store."
            Icon={ShoppingBagIcon}
          />
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShoppingCartIcon className="size-6" />
            <CardTitle className="text-xl font-medium">Last Orders</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground text-sm">
            View the last 10 orders placed in your store.
          </CardDescription>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
    </section>
  );
}
