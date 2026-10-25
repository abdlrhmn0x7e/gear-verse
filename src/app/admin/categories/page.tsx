import { CategoriesViewer } from "./_components/categories-viewer";
import { CategoryStoreProvider } from "./_store/provider";
import { requireAdmin } from "~/server/auth";
import { PageLayout } from "../_components/page-layout";
import { AddCategoryDrawer } from "../_components/drawers/add-category";

export default async function AdminCategoriesPage() {
  await requireAdmin();

  // The tree and the details each scroll on their own, so the page is pinned to the viewport.
  return (
    <PageLayout
      title="Categories"
      actions={<AddCategoryDrawer variant="default" />}
      contentWidth="fill"
      contentClassName="p-0"
    >
      <CategoryStoreProvider>
        <CategoriesViewer />
      </CategoryStoreProvider>
    </PageLayout>
  );
}
