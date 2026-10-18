import { CategoriesViewer } from "./_components/categories-viewer";
import { CategoryStoreProvider } from "./_store/provider";
import { requireAdmin } from "~/server/auth";
import { PageLayout } from "../_components/page-layout";

export default async function AdminCategoriesPage() {
  await requireAdmin();

  return (
    <PageLayout
      title="Categories"
      description="Manage, add, and edit your categories"
      contentWidth="full"
    >
      <CategoryStoreProvider>
        <CategoriesViewer />
      </CategoryStoreProvider>
    </PageLayout>
  );
}
