import type { AddressGovernoratesEnum } from "~/lib/schemas/entities/address";

/**
 * The cheapest Aramex rate for 1 kg from Helwan to each governorate, in EGP,
 * checked on aramex.com on 2026-10-31. Remote areas (Siwa, Abu Simbel, Marsa
 * Alam, Saint Catherine, Al Wahat) and heavier orders cost more, so the
 * storefront says "from" and the team confirms the fee on WhatsApp.
 */
export const SHIPPING_RATES = {
  ALEXANDRIA: 107,
  ASWAN: 142,
  ASYUT: 142,
  BEHEIRA: 117,
  BENI_SUEF: 142,
  CAIRO: 107,
  DAKAHLIA: 117,
  DAMIETTA: 117,
  FAIYUM: 142,
  GHARBIA: 117,
  GIZA: 107,
  ISMAILIA: 117,
  KAFR_EL_SHEIKH: 117,
  LUXOR: 142,
  MATROUH: 142,
  MINYA: 142,
  MONUFIA: 117,
  NEW_VALLEY: 307,
  NORTH_SINAI: 307,
  PORT_SAID: 117,
  QALYUBIA: 107,
  QENA: 142,
  RED_SEA: 142,
  SHARQIA: 117,
  SOHAG: 142,
  SOUTH_SINAI: 142,
  SUEZ: 117,
} satisfies Record<AddressGovernoratesEnum, number>;
