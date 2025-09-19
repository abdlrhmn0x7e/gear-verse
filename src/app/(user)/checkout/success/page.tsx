import { notFound } from "next/navigation";
import { api } from "~/trpc/server";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId: string }>;
}) {
  const { orderId } = await searchParams;
  const parsedOrderId = parseInt(orderId);
  if (isNaN(parsedOrderId)) {
    return notFound();
  }

  const order = await api.user.orders.findById();
  if (!order) {
    return notFound();
  }

  return <div>Success</div>;
}
