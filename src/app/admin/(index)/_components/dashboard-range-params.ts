import { createLoader, parseAsStringEnum } from "nuqs/server";
import type { DashboardRange } from "~/server/application/helpers/dashboard-range";

export const ranges = ["today", "7d", "30d"] as const satisfies DashboardRange[];

export const rangeParser = parseAsStringEnum([...ranges]).withDefault("7d");

export const rangeLabels: Record<DashboardRange, string> = {
  today: "Today",
  "7d": "7 days",
  "30d": "30 days",
};

/** What a period is compared with, worded for "vs …". */
export const previousPeriodLabels: Record<DashboardRange, string> = {
  today: "yesterday by this time",
  "7d": "the previous 7 days",
  "30d": "the previous 30 days",
};

/** The panel names for a range: "in the last 7 days". */
export const periodLabels: Record<DashboardRange, string> = {
  today: "today",
  "7d": "in the last 7 days",
  "30d": "in the last 30 days",
};

export const loadDashboardSearchParams = createLoader({ range: rangeParser });
