import { FoldersIcon } from "lucide-react";
import Header from "~/components/header";
import { CategoriesViewer } from "./_components/categories-viewer";
import { CategoryStoreProvider } from "./_store/provider";

export default function AdminCategoriesPage() {
  return (
    <section className="flex h-full flex-col gap-6">
      <Header
        title="Categories"
        description="Manage, add, and edit your categories"
        Icon={FoldersIcon}
      />

      <CategoryStoreProvider>
        <CategoriesViewer />
      </CategoryStoreProvider>
    </section>
  );
}
