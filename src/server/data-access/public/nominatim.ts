import { env } from "~/env";

/** The parts of a Nominatim `jsonv2` reverse result the address form uses. */
export type NominatimAddress = {
  house_number?: string;
  road?: string;
  pedestrian?: string;
  neighbourhood?: string;
  quarter?: string;
  suburb?: string;
  city_district?: string;
  district?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  "ISO3166-2-lvl4"?: string;
  country_code?: string;
};

const ENDPOINT = "https://nominatim.openstreetmap.org/reverse";
// Nominatim's usage policy asks every client to identify itself
const USER_AGENT = `GearVerse/1.0 (+${env.NEXT_PUBLIC_APP_URL})`;
const TIMEOUT_MS = 5000;

export const _nominatim = {
  queries: {
    /**
     * One reverse lookup. Resolves to `null` when Nominatim has no address
     * for the point (open desert, the sea); throws on network or HTTP errors.
     * Callers own the rate limit and the cache.
     */
    reverse: async ({
      latitude,
      longitude,
    }: {
      latitude: number;
      longitude: number;
    }): Promise<NominatimAddress | null> => {
      const url = new URL(ENDPOINT);
      url.search = new URLSearchParams({
        format: "jsonv2",
        lat: latitude.toString(),
        lon: longitude.toString(),
        zoom: "18",
        addressdetails: "1",
        "accept-language": "ar,en",
      }).toString();

      const response = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          Referer: env.NEXT_PUBLIC_APP_URL,
          Accept: "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new Error(`Nominatim responded ${response.status}`);
      }

      const body = (await response.json()) as {
        error?: string;
        address?: NominatimAddress;
      };

      return body.error ? null : (body.address ?? null);
    },
  },
};
