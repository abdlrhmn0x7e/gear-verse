export const STREET_ZOOM = 17;

export type Coordinates = { latitude: number; longitude: number };

export type MapFocus = {
  coordinates: Coordinates;
  zoom: number;
  /** A new key moves the camera again, even to the same spot. */
  key: number;
};
