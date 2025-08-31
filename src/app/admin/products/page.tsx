import Link from "next/link";
import { Heading } from "~/components/heading";

export default function AdminProductsPage() {
  return (
    <section>
      <Heading level={3}>Products</Heading>
      <Link href="/admin/products/add">Add Product</Link>
    </section>
  );
}
