"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { Map as MapLibreMap, Marker } from "maplibre-gl";
import { useTheme } from "next-themes";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { STREET_ZOOM, type Coordinates, type MapFocus } from "./types";

const STYLES = {
  light: "https://tiles.openfreemap.org/styles/liberty",
  dark: "https://tiles.openfreemap.org/styles/dark",
};

const CAIRO: Coordinates = { latitude: 30.0444, longitude: 31.2357 };
const CITY_ZOOM = 11;

const PIN_SVG = `<svg viewBox="0 0 24 32" aria-hidden="true" class="h-9 w-7 text-primary drop-shadow-md"><path fill="currentColor" d="M12 0C5.37 0 0 5.3 0 11.86 0 20.8 12 32 12 32s12-11.2 12-20.14C24 5.3 18.63 0 12 0Z"/><circle cx="12" cy="12" r="4.25" class="fill-primary-foreground"/></svg>`;

function createPinElement() {
  const element = document.createElement("div");
  // a 44px box around the 28px pin so it's easy to grab with a thumb
  element.className =
    "flex size-11 cursor-grab items-end justify-center active:cursor-grabbing";
  element.innerHTML = PIN_SVG;
  return element;
}

function supportsWebGL() {
  const canvas = document.createElement("canvas");
  return !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
}

function toLngLat({ latitude, longitude }: Coordinates): [number, number] {
  return [longitude, latitude];
}

export default function LocationMap({
  pin,
  focus,
  onPinChange,
}: {
  pin: Coordinates | null;
  /** Moves the camera whenever its `key` changes; dragging the pin doesn't. */
  focus: MapFocus | null;
  onPinChange: (coordinates: Coordinates) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const [failed] = useState(() => !supportsWebGL());
  const { resolvedTheme } = useTheme();
  const style = resolvedTheme === "dark" ? STYLES.dark : STYLES.light;

  const placePin = useEffectEvent((coordinates: Coordinates) => {
    onPinChange(coordinates);
  });

  const initialView = useEffectEvent(() => {
    if (focus) return { center: focus.coordinates, zoom: focus.zoom };
    if (pin) return { center: pin, zoom: STREET_ZOOM };
    return { center: CAIRO, zoom: CITY_ZOOM };
  });

  const initialStyle = useEffectEvent(() => style);

  useEffect(() => {
    if (!containerRef.current || failed) return;

    const { center, zoom } = initialView();
    let map: MapLibreMap;
    try {
      map = new MapLibreMap({
        container: containerRef.current,
        style: initialStyle(),
        center: toLngLat(center),
        zoom,
        attributionControl: { compact: true },
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
      });
    } catch {
      return;
    }

    map.touchZoomRotate.disableRotation();
    map.keyboard.disableRotation();
    map.on("click", (event) => {
      placePin({ latitude: event.lngLat.lat, longitude: event.lngLat.lng });
    });
    mapRef.current = map;

    return () => {
      markerRef.current = null;
      mapRef.current = null;
      map.remove();
    };
  }, [failed]);

  useEffect(() => {
    mapRef.current?.setStyle(style);
  }, [style]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!pin) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    if (!markerRef.current) {
      const marker = new Marker({
        element: createPinElement(),
        anchor: "bottom",
        draggable: true,
      });
      marker.on("dragend", () => {
        const { lat, lng } = marker.getLngLat();
        placePin({ latitude: lat, longitude: lng });
      });
      markerRef.current = marker;
    }

    markerRef.current.setLngLat(toLngLat(pin)).addTo(map);
  }, [pin]);

  useEffect(() => {
    if (!focus) return;
    mapRef.current?.flyTo({
      center: toLngLat(focus.coordinates),
      zoom: focus.zoom,
      essential: false,
    });
  }, [focus]);

  // without WebGL the location button and the fields still work
  if (failed) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center p-6 text-center text-sm text-balance">
        The map can&apos;t load in this browser. Use your current location or
        type the address below.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Map. Tap to drop the delivery pin, then drag it to adjust."
      className="absolute inset-0"
    />
  );
}
