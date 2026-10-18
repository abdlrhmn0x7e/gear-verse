type MaybeCoordinates = {
  latitude?: number | null;
  longitude?: number | null;
};

/** Six decimals is about 10 cm, finer than any phone's GPS. */
function formatCoordinate(value: number) {
  return Number(value.toFixed(6)).toString();
}

/**
 * A Google Maps link that drops a pin on the address's saved location, or
 * `null` when the address has no pin. Needs no API key.
 */
export function googleMapsUrl(address: MaybeCoordinates | null | undefined) {
  if (address?.latitude == null || address.longitude == null) return null;

  const query = `${formatCoordinate(address.latitude)},${formatCoordinate(address.longitude)}`;
  return `https://www.google.com/maps?q=${query}`;
}
