import { Suspense } from "react";

import { requireAdmin } from "~/server/auth";
import { api } from "~/trpc/server";
import { PageLayout } from "../_components/page-layout";
import { ConnectAiCard } from "./_components/connect-ai-card";
import {
  StoreSettingsForm,
  StoreSettingsFormSkeleton,
} from "./_components/store-settings-form";

export default async function AdminSettingsPage() {
  await requireAdmin();

  return (
    <PageLayout
      title="Store settings"
      description="Contact details and social links shown on the store, who gets order emails, and the WhatsApp order messages."
    >
      <div className="flex flex-col gap-10">
        <Suspense fallback={<StoreSettingsFormSkeleton />}>
          <StoreSettings />
        </Suspense>
        <ConnectAiCard />
      </div>
    </PageLayout>
  );
}

async function StoreSettings() {
  const settings = await api.admin.settings.queries.get();
  return <StoreSettingsForm settings={settings} />;
}
