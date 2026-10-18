/**
 * Date windows for the admin dashboard. The store runs on Cairo time, so
 * "today" and every day bucket start at midnight in Africa/Cairo (which keeps
 * daylight saving time), not at midnight UTC or on the server's clock.
 */

export const DASHBOARD_TIME_ZONE = "Africa/Cairo";

export const dashboardRanges = ["today", "7d", "30d"] as const;
export type DashboardRange = (typeof dashboardRanges)[number];

/** Today is bucketed by hour; the longer ranges by day. */
export type BucketUnit = "hour" | "day";

const DAY_MS = 24 * 60 * 60 * 1000;

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: DASHBOARD_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function cairoParts(date: Date) {
  const parts = Object.fromEntries(
    partsFormatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  ) as Record<"year" | "month" | "day" | "hour" | "minute" | "second", string>;

  return parts;
}

/** How far Cairo's wall clock is ahead of UTC at this instant, in ms. */
function cairoOffsetMs(date: Date) {
  const p = cairoParts(date);
  const asUtc = Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
    Number(p.hour),
    Number(p.minute),
    Number(p.second),
  );

  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** The instant Cairo's calendar day containing `date` began. */
export function startOfCairoDay(date: Date) {
  const p = cairoParts(date);
  const midnightAsUtc = Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
  );
  // The offset at midnight can differ from the offset now on the days the
  // clocks change, so take it again at the first guess.
  const guess = midnightAsUtc - cairoOffsetMs(date);

  return new Date(midnightAsUtc - cairoOffsetMs(new Date(guess)));
}

/** The start of the Cairo day `days` calendar days after the one `dayStart` is in. */
export function addCairoDays(dayStart: Date, days: number) {
  // Aim at midday so an hour gained or lost to daylight saving can't push
  // the instant into the neighbouring day.
  return startOfCairoDay(
    new Date(dayStart.getTime() + days * DAY_MS + DAY_MS / 2),
  );
}

/** "2026-10-18": the Cairo calendar day of an instant. */
export function cairoDayKey(date: Date) {
  const p = cairoParts(date);
  return `${p.year}-${p.month}-${p.day}`;
}

/** "2026-10-18T14": the Cairo calendar day and hour of an instant. */
export function cairoHourKey(date: Date) {
  const p = cairoParts(date);
  return `${p.year}-${p.month}-${p.day}T${p.hour}`;
}

export type DashboardWindow = {
  range: DashboardRange;
  unit: BucketUnit;
  /** The current period: [start, end). */
  start: Date;
  end: Date;
  /** The same stretch of the clock one range earlier: [previousStart, previousEnd). */
  previousStart: Date;
  previousEnd: Date;
  /** Every bucket in the current period, oldest first. */
  bucketKeys: string[];
};

/**
 * The current period runs from the start of the range's first Cairo day up to
 * now: today alone, or the last 7 or 30 days including today. The previous
 * period is the same length, moved back by the range's days, so on a Saturday
 * at 14:00 "Today" compares with Friday 00:00–14:00 and "7 days" with the week
 * before up to the same time of day.
 */
export function getDashboardWindow(
  range: DashboardRange,
  now: Date = new Date(),
): DashboardWindow {
  const today = startOfCairoDay(now);
  const days = range === "today" ? 1 : range === "7d" ? 7 : 30;
  const start = addCairoDays(today, -(days - 1));
  const previousStart = addCairoDays(start, -days);
  const previousEnd = new Date(
    previousStart.getTime() + (now.getTime() - start.getTime()),
  );

  if (range === "today") {
    const hours = Array.from(
      { length: 24 },
      (_, hour) => `${cairoDayKey(today)}T${String(hour).padStart(2, "0")}`,
    );

    return {
      range,
      unit: "hour",
      start,
      end: now,
      previousStart,
      previousEnd,
      bucketKeys: hours,
    };
  }

  return {
    range,
    unit: "day",
    start,
    end: now,
    previousStart,
    previousEnd,
    bucketKeys: Array.from({ length: days }, (_, i) =>
      cairoDayKey(addCairoDays(start, i)),
    ),
  };
}

/** One value per bucket key, in key order; buckets with no rows are 0. */
export function fillBuckets(
  keys: string[],
  rows: { key: string; value: number }[],
) {
  const values = new Map<string, number>();
  for (const row of rows) {
    values.set(row.key, (values.get(row.key) ?? 0) + row.value);
  }

  return keys.map((key) => ({ key, value: values.get(key) ?? 0 }));
}

export type PeriodChange = {
  direction: "up" | "down" | "flat";
  /** Whole percent change from the previous period; null when it had nothing to compare with. */
  percent: number | null;
};

/** How the current period moved against the previous one. */
export function comparePeriods(
  current: number,
  previous: number,
): PeriodChange {
  if (previous === 0) {
    return {
      direction: current > 0 ? "up" : "flat",
      percent: current > 0 ? null : 0,
    };
  }

  const percent = Math.round(((current - previous) / previous) * 100);

  return {
    direction: percent > 0 ? "up" : percent < 0 ? "down" : "flat",
    percent: Math.abs(percent),
  };
}
