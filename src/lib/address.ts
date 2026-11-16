type StreetParts = {
  address: string;
  buildingNameOrNumber: string;
  floor?: string | null;
  apartment?: string | null;
};

/** "15 Abbas St, Building 12, Floor 3, Apt 5": each part labelled so a courier can't mix them up. */
export function formatStreetLine(parts: StreetParts) {
  const building = parts.buildingNameOrNumber.trim();
  return [
    parts.address,
    // older addresses hold free text like "Building 12, floor 3" here
    /^\d/.test(building) ? `Building ${building}` : building,
    parts.floor && `Floor ${parts.floor}`,
    parts.apartment && `Apt ${parts.apartment}`,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
}
