"use client";

import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { DashboardRange } from "~/server/application/helpers/dashboard-range";
import { rangeLabels, useDashboardRange } from "./use-dashboard-range";

/** Today / 7 days / 30 days for every period-bound panel. */
export function RangeSwitch() {
  const { range, setRange, ranges } = useDashboardRange();

  return (
    <Tabs
      value={range}
      onValueChange={(value) => void setRange(value as DashboardRange)}
    >
      <TabsList aria-label="Period">
        {ranges.map((value) => (
          <TabsTrigger key={value} value={value}>
            {rangeLabels[value]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
