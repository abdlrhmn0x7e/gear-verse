import { IconKeyframes } from "@tabler/icons-react";
import Header from "~/components/header";
import { requireAdmin } from "~/server/auth";
import { AttributesViewer } from "./_components/attributes-viewer";
import { AttributeStoreProvider } from "./_store/provider";

export default async function AdminAttributesPage() {
  await requireAdmin();

  return (
    <section className="flex h-full flex-col gap-6">
      <Header
        title="Attributes"
        description="Manage, add, and edit your attributes"
        Icon={IconKeyframes}
      />

      <AttributeStoreProvider>
        <AttributesViewer />
      </AttributeStoreProvider>
    </section>
  );
}
