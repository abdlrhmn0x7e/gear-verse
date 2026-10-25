import { AddProduct } from "./_components/add-product";
import { requireAdmin } from "~/server/auth";

export default async function AdminProductsAddPage() {
  await requireAdmin();

  return <AddProduct />;
}
