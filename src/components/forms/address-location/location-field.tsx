"use client";

import {
  IconCurrentLocation,
  IconExternalLink,
  IconLocationOff,
  IconMap,
  IconMapPinFilled,
  IconX,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { googleMapsUrl } from "~/lib/google-maps";
import type { ReverseGeocodeResult } from "~/lib/schemas/contracts/public/geocoding";
import { useTRPC } from "~/trpc/client";
import { STREET_ZOOM, type Coordinates, type MapFocus } from "./types";

// MapLibre is over a megabyte, so it loads only once the form is on screen
const LocationMap = dynamic(() => import("./location-map"), {
  ssr: false,
  loading: () => <MapPlaceholder />,
});

const NEARBY_ZOOM = 15;
/** Waits for the pin to settle so a few quick taps cost one lookup. */
const LOOKUP_DELAY_MS = 700;

type LocateState =
  | { status: "idle" | "locating" }
  | {
      status: "error";
      reason: "denied" | "timeout" | "unavailable" | "unsupported";
    };

const LOCATE_ERRORS = {
  denied:
    "Location access is turned off for this site. Allow it in your browser settings, or tap the map to drop the pin yourself.",
  timeout:
    "Finding your location took too long. Try again, or tap the map to drop the pin.",
  unavailable:
    "Your location isn't available right now. Check that location services are on, or tap the map to drop the pin.",
  unsupported:
    "This browser can't share your location. Tap the map to drop the pin instead.",
} as const;

function locateError(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) return "denied";
  if (error.code === error.TIMEOUT) return "timeout";
  return "unavailable";
}

function toCoordinates(position: GeolocationPosition): Coordinates {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

export function LocationField({
  value,
  onChange,
  onAddressFound,
}: {
  value: Coordinates | null;
  onChange: (coordinates: Coordinates | null) => void;
  /** Called with what the address lookup found at the pin; never on failure. */
  onAddressFound: (result: ReverseGeocodeResult) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [locate, setLocate] = useState<LocateState>({ status: "idle" });
  const [focus, setFocus] = useState<MapFocus | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const lookupTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lookupId = useRef(0);
  // bumped by every locate request and every pin the customer places, so a late GPS reading never moves their pin
  const locateRun = useRef(0);

  // when location is already allowed, open the map where the customer is,
  // without dropping a pin they didn't ask for
  useEffect(() => {
    if (value || !navigator.permissions || !navigator.geolocation) return;

    let cancelled = false;
    void navigator.permissions
      .query({ name: "geolocation" })
      .then((permission) => {
        if (cancelled || permission.state !== "granted") return;
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (cancelled) return;
            setFocus(
              (current) =>
                current ?? {
                  coordinates: toCoordinates(position),
                  zoom: NEARBY_ZOOM,
                  key: 0,
                },
            );
          },
          () => undefined,
          { maximumAge: 5 * 60_000, timeout: 10_000 },
        );
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
    // only on open: a pin set later must not pull the camera away
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => clearTimeout(lookupTimer.current), []);

  function lookUpAddress(coordinates: Coordinates) {
    clearTimeout(lookupTimer.current);
    const id = ++lookupId.current;
    setIsLookingUp(true);

    lookupTimer.current = setTimeout(() => {
      queryClient
        .fetchQuery(
          trpc.public.geocoding.queries.reverse.queryOptions(
            {
              // rounded like the server's cache, so nearby drops share a lookup here too
              latitude: Number(coordinates.latitude.toFixed(4)),
              longitude: Number(coordinates.longitude.toFixed(4)),
            },
            { staleTime: Infinity, retry: false },
          ),
        )
        .then((result) => {
          if (id === lookupId.current && result) onAddressFound(result);
        })
        // the pin saves without an address; the customer types it instead
        .catch(() => undefined)
        .finally(() => {
          if (id === lookupId.current) setIsLookingUp(false);
        });
    }, LOOKUP_DELAY_MS);
  }

  function handlePinChange(coordinates: Coordinates) {
    setLocate({ status: "idle" });
    onChange(coordinates);
    lookUpAddress(coordinates);
  }

  function handleClear() {
    clearTimeout(lookupTimer.current);
    lookupId.current++;
    setIsLookingUp(false);
    onChange(null);
  }

  function handleLocate() {
    if (!navigator.geolocation) {
      setLocate({ status: "error", reason: "unsupported" });
      return;
    }

    setLocate({ status: "locating" });
    // A quick network fix (Wi-Fi or cell, about a second) drops the pin, then GPS refines it. Asking only for high
    // accuracy left people waiting the whole timeout, and fails outright where no GPS exists; the error shows only
    // when both readings fail.
    const run = ++locateRun.current;
    let placed = false;
    let precise = false;
    let failures = 0;
    function place(position: GeolocationPosition, isPrecise: boolean) {
      if (run !== locateRun.current || precise) return;
      placed = true;
      precise = isPrecise;
      const coordinates = toCoordinates(position);
      setFocus((current) => ({
        coordinates,
        zoom: STREET_ZOOM,
        key: (current?.key ?? 0) + 1,
      }));
      handlePinChange(coordinates);
    }
    function fail(error: GeolocationPositionError) {
      failures++;
      if (run !== locateRun.current || placed) return;
      if (error.code === error.PERMISSION_DENIED || failures === 2) {
        setLocate({ status: "error", reason: locateError(error) });
      }
    }
    navigator.geolocation.getCurrentPosition(
      (position) => place(position, false),
      fail,
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 10 * 60_000 },
    );
    navigator.geolocation.getCurrentPosition(
      (position) => place(position, true),
      fail,
      { enableHighAccuracy: true, timeout: 20_000, maximumAge: 0 },
    );
  }

  const mapsUrl = googleMapsUrl(value);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">Delivery location</p>
          <p className="text-muted-foreground text-xs">
            Optional. Helps the courier find your door.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleLocate}
          disabled={locate.status === "locating"}
        >
          {locate.status === "locating" ? (
            <Spinner size="small" data-icon="inline-start" />
          ) : (
            <IconCurrentLocation data-icon="inline-start" />
          )}
          {locate.status === "locating"
            ? "Finding you…"
            : "Use my current location"}
        </Button>
      </div>

      {locate.status === "error" && (
        <p
          role="alert"
          className="text-muted-foreground flex gap-2 text-sm text-pretty"
        >
          <IconLocationOff className="text-foreground mt-0.5 size-4 shrink-0" />
          {LOCATE_ERRORS[locate.reason]}
        </p>
      )}

      {/* data-base-ui-swipe-ignore: panning the map must not swipe the drawer it sits in */}
      <div
        data-base-ui-swipe-ignore
        className="bg-input-background border-input relative h-52 overflow-hidden rounded-2xl border sm:h-60"
      >
        <LocationMap
          pin={value}
          focus={focus}
          onPinChange={(coordinates) => {
            locateRun.current++;
            handlePinChange(coordinates);
          }}
        />
        {!value && (
          <p className="bg-popover/90 text-foreground surface-floating pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap shadow-sm">
            Tap the map to drop a pin
          </p>
        )}
      </div>

      {value && mapsUrl && (
        <div className="bg-input-background border-input flex items-center gap-3 rounded-2xl border py-1.5 pe-1.5 ps-3.5">
          {isLookingUp ? (
            <Spinner size="small" className="text-muted-foreground shrink-0" />
          ) : (
            <IconMapPinFilled className="text-primary size-4 shrink-0" />
          )}
          <div className="flex min-w-0 flex-1 flex-col items-start">
            <p className="flex max-w-full min-w-0 items-baseline gap-2 text-sm">
              <span className="font-medium whitespace-nowrap">
                Pinned location
              </span>
              <span className="text-muted-foreground truncate text-xs tabular-nums">
                {value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}
              </span>
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="-ms-2.5"
              nativeButton={false}
              render={<a href={mapsUrl} target="_blank" rel="noreferrer" />}
            >
              <IconExternalLink data-icon="inline-start" />
              Open in Google Maps
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Remove pin"
            onClick={handleClear}
          >
            <IconX />
          </Button>
        </div>
      )}
    </div>
  );
}

function MapPlaceholder() {
  return (
    <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 text-sm">
      <IconMap className="size-6 opacity-60" />
      Loading map…
    </div>
  );
}
