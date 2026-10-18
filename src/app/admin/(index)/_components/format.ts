import { whatsAppLink } from "~/lib/whatsapp";

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

/**
 * The digits wa.me wants for an address's phone number: the full international
 * number with no plus or zeros in front. Egyptian numbers are stored either as
 * typed ("01012345678") or in E.164 ("+201012345678"); both come out as
 * "201012345678". Returns null for anything too short to dial.
 */
export function toWhatsAppNumber(phone: string) {
  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("00")) digits = digits.slice(2);

  // a local number with its trunk 0: 01x xxxx xxxx
  if (digits.length === 11 && digits.startsWith("0")) {
    return `20${digits.slice(1)}`;
  }

  // a local mobile number typed without the 0: 1x xxxx xxxx
  if (digits.length === 10 && digits.startsWith("1")) {
    return `20${digits}`;
  }

  // "+20 0101…" keeps a stray trunk 0 after the country code
  if (digits.length === 13 && digits.startsWith("200")) {
    return `20${digits.slice(3)}`;
  }

  return digits.length >= 8 ? digits : null;
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

/** A wa.me link that opens a chat with the customer, the confirmation message typed in. */
export function whatsAppConfirmationLink({
  phone,
  customerName,
  orderId,
  total,
}: {
  phone: string;
  customerName: string;
  orderId: number;
  total: number;
}) {
  const number = toWhatsAppNumber(phone);
  if (!number) return null;

  const message = `Hi ${firstName(customerName)}, this is Gear Verse about your order #${orderId} (${formatMoney(total).replace(/\s/g, " ")}). We'd like to confirm it and your shipping fee before we ship. Is now a good time?`;

  return whatsAppLink(number, message);
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
