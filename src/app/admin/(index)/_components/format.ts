import { formatStreetLine } from "~/lib/address";

const HOUR_MS = 60 * 60 * 1000;

/** A pending order this old has waited too long for its confirmation call. */
export const OVERDUE_AFTER_MS = 24 * HOUR_MS;

export function isOverdue(createdAt: Date, now: Date = new Date()) {
  return now.getTime() - createdAt.getTime() > OVERDUE_AFTER_MS;
}

/** How long ago, in the largest whole unit that fits: "12m", "5h", "3d". */
export function formatAge(createdAt: Date, now: Date = new Date()) {
  const ms = Math.max(0, now.getTime() - createdAt.getTime());
  const minutes = Math.floor(ms / 60_000);

  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h`;

  return `${Math.floor(hours / 24)}d`;
}

export function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

const moneyFormatter = new Intl.NumberFormat("en-EG", {
  style: "currency",
  currency: "EGP",
  maximumFractionDigits: 0,
});

/** Whole pounds: "EGP 4,250". Prices are stored in whole pounds. */
export function formatMoney(amount: number) {
  return moneyFormatter.format(amount);
}

/** A tel: link that keeps the leading plus of an international number. */
export function telLink(phone: string) {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");
  return `tel:${trimmed.startsWith("+") ? "+" : ""}${digits}`;
}

/** "KAFR_EL_SHEIKH" → "Kafr El Sheikh". */
export function formatGovernorate(governorate: string) {
  return governorate
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** "12 Tahrir St, Building 4, Floor 2, Apt 6, Nasr City, Cairo, next to the bank": a delivery address on one line, for couriers and copying. */
export function formatAddressLine(
  address:
    | (Parameters<typeof formatStreetLine>[0] & {
        city: string;
        governorate: string;
        additionalDetails?: string | null;
      })
    | null
    | undefined,
) {
  if (!address) return "";
  return [
    formatStreetLine(address),
    address.city,
    formatGovernorate(address.governorate),
    address.additionalDetails ?? "",
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

const cairoHourFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  hourCycle: "h23",
  timeZone: "Africa/Cairo",
});

/** Good morning until noon, afternoon until 5pm, evening after, on Cairo's clock. */
export function greetingFor(date: Date) {
  const hour = Number(cairoHourFormatter.format(date));
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
