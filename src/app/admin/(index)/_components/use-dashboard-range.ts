import { useTransition } from "react";
import { useQueryState } from "nuqs";
import { rangeParser, ranges } from "./dashboard-range-params";

export {
  periodLabels,
  previousPeriodLabels,
  rangeLabels,
} from "./dashboard-range-params";

/**
 * The dashboard's period, kept in `?range=`. Switching it refetches on the
 * client inside a transition, so the panels keep their numbers until the new
 * ones arrive instead of falling back to skeletons.
 */
export function useDashboardRange() {
  const [isPending, startTransition] = useTransition();
  const [range, setRange] = useQueryState(
    "range",
    rangeParser.withOptions({ shallow: true, startTransition }),
  );

  return { range, setRange, isPending, ranges };
}
