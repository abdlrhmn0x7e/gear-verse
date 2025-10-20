import { Card, CardHeader } from "~/components/ui/card";
import type { RouterOutputs } from "~/trpc/react";

export function OrderCard({
  order,
}: {
  order: RouterOutputs["public"]["orders"]["queries"]["findAll"][number];
}) {
  return (
    <Card>
      <CardHeader></CardHeader>
    </Card>
  );
}
