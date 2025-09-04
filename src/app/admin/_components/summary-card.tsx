import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";

export default function SummaryCard({
  title,
  value,
  Icon,
  description,
}: {
  title: string;
  value: string;
  description: string;
  Icon: LucideIcon;
}) {
  return (
    <Card className="from-card to-background bg-gradient-to-b">
      <CardContent className="flex items-center justify-between">
        <div>
          <h4 className="text-muted-foreground text-lg">{title}</h4>
          <p className="text-accent-foreground text-4xl font-bold">{value}</p>
          <p className="text-muted-foreground mt-2 text-sm">{description}</p>
        </div>

        <div className="from-card to-accent rounded-lg bg-gradient-to-b p-px">
          <div className="to-card from-accent rounded-lg bg-radial p-2">
            <Icon size={32} className="text-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
