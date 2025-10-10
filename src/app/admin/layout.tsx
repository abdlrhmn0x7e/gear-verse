import {
  SidebarInset,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { AdminSidebar } from "./_components/admin-sidebar";
import { Separator } from "~/components/ui/separator";
import { AdminBreadcrumb } from "./_components/admin-breadcrumb";
import { ModeDropdown } from "~/components/mode-toggle";
import { auth } from "~/server/auth";
import { headers } from "next/headers";
import { Kbd, KbdGroup } from "~/components/ui/kbd";
import { notFound } from "next/navigation";
import {
  ProductSearchDialog,
  ProductSearchIcon,
  ProductSearchPlaceholder,
} from "~/components/product-search-dialog";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.role !== "admin") {
    return notFound();
  }

  return (
    <SidebarProvider>
      <AdminSidebar />

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b pr-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <AdminBreadcrumb />
          </div>

          <ModeDropdown />
        </header>

        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
