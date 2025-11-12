import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { AdminSidebar } from "./_components/admin-sidebar";
import { Separator } from "~/components/ui/separator";
import { AdminBreadcrumb } from "./_components/admin-breadcrumb";
import { ModeToggle } from "~/components/mode-toggle";
import { WiseWords } from "./_components/wise-words";
import { Suspense } from "react";
import { requireAdmin } from "~/server/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <Suspense>
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

            <div className="flex items-center gap-2">
              <WiseWords />
              <ModeToggle />
            </div>
          </header>

          <main className="flex-1 p-4">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </Suspense>
  );
}
