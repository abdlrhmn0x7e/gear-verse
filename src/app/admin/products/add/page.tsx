import { Heading } from "~/components/heading";
import { Editor } from "./_components/editor";

export default function AdminProductsAddPage() {
  return (
    <section>
      <Heading level={3}>Add Product</Heading>
      <Editor />
    </section>
  );
}
