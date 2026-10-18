import { Redis } from "@upstash/redis";
import { env } from "~/env";
import {
  addressGovernoratesEnum,
  type AddressGovernoratesEnum,
} from "~/lib/schemas/entities/address";
import type {
  ReverseGeocodeInput,
  ReverseGeocodeResult,
} from "~/lib/schemas/contracts/public/geocoding";
import { data } from "~/server/data-access";
import type { NominatimAddress } from "~/server/data-access/public/nominatim";

/*
 * Nominatim's public instance allows at most one request per second for the
 * whole application, so every lookup takes a slot that is shared across server
 * instances through Redis (in-process when Redis isn't configured), and results
 * are cached by rounded coordinates so a pin dropped twice on the same spot
 * costs one request.
 */

/** Four decimals is about 11 m: one cache entry per building or two. */
const COORDINATE_PRECISION = 4;
/** A little over a second, so clock drift between instances can't crowd two requests into one. */
const SLOT_MS = 1100;
/** How long a lookup waits for a free slot before giving up quietly. */
const MAX_WAIT_MS = 3000;
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 30;
const EMPTY_CACHE_TTL_SECONDS = 60 * 60 * 24;
const MEMORY_CACHE_LIMIT = 500;

const redis =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const SLOT_KEY = "geocoding:nominatim:slot";
const cacheKey = (key: string) => `geocoding:nominatim:reverse:${key}`;

const memoryCache = new Map<string, ReverseGeocodeResult>();
let nextLocalSlotAt = 0;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function takeSlot(): Promise<boolean> {
  const deadline = Date.now() + MAX_WAIT_MS;

  if (redis) {
    try {
      while (true) {
        const taken = await redis.set(SLOT_KEY, 1, { nx: true, px: SLOT_MS });
        if (taken) return true;

        const ttl = await redis.pttl(SLOT_KEY);
        const wait = Math.max(ttl, 50);
        if (Date.now() + wait > deadline) return false;
        await sleep(wait);
      }
    } catch {
      // Redis being down shouldn't take the lookup with it
    }
  }

  const now = Date.now();
  const slotAt = Math.max(now, nextLocalSlotAt);
  if (slotAt > deadline) return false;

  nextLocalSlotAt = slotAt + SLOT_MS;
  await sleep(slotAt - now);
  return true;
}

async function readCache(key: string) {
  const local = memoryCache.get(key);
  if (local) return local;
  if (!redis) return null;

  try {
    const cached = await redis.get<ReverseGeocodeResult>(cacheKey(key));
    if (cached) remember(key, cached);
    return cached;
  } catch {
    return null;
  }
}

function remember(key: string, result: ReverseGeocodeResult) {
  if (memoryCache.size >= MEMORY_CACHE_LIMIT) {
    const oldest = memoryCache.keys().next().value;
    if (oldest !== undefined) memoryCache.delete(oldest);
  }
  memoryCache.set(key, result);
}

async function writeCache(key: string, result: ReverseGeocodeResult) {
  remember(key, result);
  if (!redis) return;

  const isEmpty = !result.governorate && !result.city && !result.street;
  try {
    await redis.set(cacheKey(key), result, {
      ex: isEmpty ? EMPTY_CACHE_TTL_SECONDS : CACHE_TTL_SECONDS,
    });
  } catch {
    // the in-memory copy still saves the next lookup on this instance
  }
}

const isoGovernorates: Record<string, AddressGovernoratesEnum> = {
  "EG-ALX": "ALEXANDRIA",
  "EG-ASN": "ASWAN",
  "EG-AST": "ASYUT",
  "EG-BH": "BEHEIRA",
  "EG-BNS": "BENI_SUEF",
  "EG-C": "CAIRO",
  "EG-DK": "DAKAHLIA",
  "EG-DT": "DAMIETTA",
  "EG-FYM": "FAIYUM",
  "EG-GH": "GHARBIA",
  "EG-GZ": "GIZA",
  "EG-IS": "ISMAILIA",
  "EG-KFS": "KAFR_EL_SHEIKH",
  "EG-LX": "LUXOR",
  "EG-MT": "MATROUH",
  "EG-MN": "MINYA",
  "EG-MNF": "MONUFIA",
  "EG-WAD": "NEW_VALLEY",
  "EG-SIN": "NORTH_SINAI",
  "EG-PTS": "PORT_SAID",
  "EG-KB": "QALYUBIA",
  "EG-KN": "QENA",
  "EG-BA": "RED_SEA",
  "EG-SHR": "SHARQIA",
  "EG-SHG": "SOHAG",
  "EG-JS": "SOUTH_SINAI",
  "EG-SUZ": "SUEZ",
};

const arabicGovernorates: Record<string, AddressGovernoratesEnum> = {
  الاسكندريه: "ALEXANDRIA",
  اسوان: "ASWAN",
  اسيوط: "ASYUT",
  البحيره: "BEHEIRA",
  بنيسويف: "BENI_SUEF",
  القاهره: "CAIRO",
  الدقهليه: "DAKAHLIA",
  دمياط: "DAMIETTA",
  الفيوم: "FAIYUM",
  الغربيه: "GHARBIA",
  الجيزه: "GIZA",
  الاسماعيليه: "ISMAILIA",
  كفرالشيخ: "KAFR_EL_SHEIKH",
  الاقصر: "LUXOR",
  مطروح: "MATROUH",
  المنيا: "MINYA",
  المنوفيه: "MONUFIA",
  الواديالجديد: "NEW_VALLEY",
  شمالسيناء: "NORTH_SINAI",
  بورسعيد: "PORT_SAID",
  القليوبيه: "QALYUBIA",
  قنا: "QENA",
  البحرالاحمر: "RED_SEA",
  الشرقيه: "SHARQIA",
  سوهاج: "SOHAG",
  جنوبسيناء: "SOUTH_SINAI",
  السويس: "SUEZ",
};

/** Folds the spellings Nominatim uses for a state into one comparable key. */
function normalizeStateName(state: string) {
  return state
    .toLowerCase()
    .replace(/محافظة|governorate/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/[^a-zء-ي]/g, "");
}

function toGovernorate(
  address: NominatimAddress,
): AddressGovernoratesEnum | null {
  const iso = address["ISO3166-2-lvl4"];
  if (iso && iso in isoGovernorates) return isoGovernorates[iso]!;
  if (!address.state) return null;

  const state = normalizeStateName(address.state);
  return (
    arabicGovernorates[state] ??
    addressGovernoratesEnum.options.find(
      (governorate) => governorate.toLowerCase().replace(/_/g, "") === state,
    ) ??
    null
  );
}

function toResult(address: NominatimAddress | null): ReverseGeocodeResult {
  if (!address) return { governorate: null, city: null, street: null };

  // the form's "City" is the area a courier asks for, e.g. Nasr City rather than Cairo
  const city =
    address.suburb ??
    address.city_district ??
    address.district ??
    address.city ??
    address.town ??
    address.village ??
    address.county ??
    null;
  const road = address.road ?? address.pedestrian;
  const street = road
    ? [address.house_number, road].filter(Boolean).join(" ")
    : null;

  return {
    governorate: address.country_code === "eg" ? toGovernorate(address) : null,
    city,
    street,
  };
}

export const _geocoding = {
  queries: {
    /**
     * The governorate, area and street at a point, for prefilling an address.
     * Resolves to `null` when no lookup slot frees up in time; the caller
     * treats that like any other miss.
     */
    reverse: async ({
      latitude,
      longitude,
    }: ReverseGeocodeInput): Promise<ReverseGeocodeResult | null> => {
      const lat = Number(latitude.toFixed(COORDINATE_PRECISION));
      const lng = Number(longitude.toFixed(COORDINATE_PRECISION));
      const key = `${lat},${lng}`;

      const cached = await readCache(key);
      if (cached) return cached;

      if (!(await takeSlot())) return null;

      const address = await data.public.nominatim.queries.reverse({
        latitude: lat,
        longitude: lng,
      });
      const result = toResult(address);
      await writeCache(key, result);
      return result;
    },
  },
};
