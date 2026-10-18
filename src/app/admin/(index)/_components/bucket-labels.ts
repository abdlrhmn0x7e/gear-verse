const dayFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const shortDayFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/**
 * Labels for the server's bucket keys, which are already on Cairo's clock:
 * "2026-10-18" is a day, "2026-10-18T14" an hour of it. They are read back as
 * UTC so the viewer's own time zone can't shift them a day.
 */
export function bucketLabel(key: string, style: "long" | "short" = "long") {
  const [day, hour] = key.split("T");
  if (hour !== undefined) {
    const time = `${hour}:00`;
    return style === "long"
      ? `${time}–${String(Number(hour) + 1).padStart(2, "0")}:00`
      : hour;
  }

  const date = new Date(`${day}T00:00:00Z`);
  return (style === "long" ? dayFormatter : shortDayFormatter).format(date);
}
