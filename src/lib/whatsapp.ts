/** An Egyptian mobile in E.164: +20, the 1x network code, then eight digits. */
const EGYPTIAN_MOBILE_E164 = /^\+20(1\d)(\d{4})(\d{4})$/;

/**
 * An E.164 number written out the way people read it here: "+201012345678"
 * becomes "+20 10 1234 5678". Numbers from elsewhere stay as stored.
 */
export function formatWhatsAppNumber(number: string) {
  const match = EGYPTIAN_MOBILE_E164.exec(number);
  if (!match) return number;

  const [, network, first, second] = match;
  return `+20 ${network} ${first} ${second}`;
}

/** Typed into the chat when a customer reports a defective or damaged product. */
export const REPORT_ISSUE_MESSAGE =
  "Hi Gear Verse, I'd like to report a problem with a product from my order.";

/**
 * The wa.me link that opens a chat with a number, with `message` typed in
 * when given. wa.me wants the digits only, no "+".
 */
export function whatsAppLink(number: string, message?: string) {
  const url = `https://wa.me/${number.replace(/\D/g, "")}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}
