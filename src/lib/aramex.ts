/** Aramex's public tracking page for one shipment. */
export function aramexTrackingUrl(trackingNumber: string) {
  return `https://www.aramex.com/eg/en/track/results?mode=0&ShipmentNumber=${encodeURIComponent(trackingNumber)}`;
}
