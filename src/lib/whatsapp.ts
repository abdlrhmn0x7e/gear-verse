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

/** Longest item text carried into a request chat, so a pasted page can't build an unwieldy link. */
const REQUEST_ITEM_MAX_LENGTH = 300;

/** What a customer asked for, trimmed for the request chat; empty when they typed nothing. */
export function requestedItem(item?: string | null) {
  return item?.trim().slice(0, REQUEST_ITEM_MAX_LENGTH);
}

/**
 * The wa.me link that opens a chat with a number, with `message` typed in
 * when given. wa.me wants the digits only, no "+".
 */
export function whatsAppLink(number: string, message?: string) {
  const url = `https://wa.me/${number.replace(/\D/g, "")}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
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
