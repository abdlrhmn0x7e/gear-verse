import type { AddressGovernoratesEnum } from "~/lib/schemas/entities/address";

/**
 * What a customer pays to ship to each governorate, in EGP: the cheapest
 * Aramex 1 kg rate from Helwan (aramex.com, 2026-10-31) priced up with the
 * 5 EGP bank collection fee and rounded. The 120 and 130 tiers match real
 * invoices; 155 and 325 are estimates. Remote areas (Siwa, Abu Simbel, Marsa
 * Alam, Saint Catherine, Al Wahat) and heavier orders cost more, so the
 * storefront says "from" and the team confirms the fee on WhatsApp.
 */
export const SHIPPING_RATES = {
  ALEXANDRIA: 120,
  ASWAN: 155,
  ASYUT: 155,
  BEHEIRA: 130,
  BENI_SUEF: 155,
  CAIRO: 120,
  DAKAHLIA: 130,
  DAMIETTA: 130,
  FAIYUM: 155,
  GHARBIA: 130,
  GIZA: 120,
  ISMAILIA: 130,
  KAFR_EL_SHEIKH: 130,
  LUXOR: 155,
  MATROUH: 155,
  MINYA: 155,
  MONUFIA: 130,
  NEW_VALLEY: 325,
  NORTH_SINAI: 325,
  PORT_SAID: 130,
  QALYUBIA: 120,
  QENA: 155,
  RED_SEA: 155,
  SHARQIA: 130,
  SOHAG: 155,
  SOUTH_SINAI: 155,
  SUEZ: 130,
} satisfies Record<AddressGovernoratesEnum, number>;
