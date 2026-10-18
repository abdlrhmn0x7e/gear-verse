"use client";

import { useState } from "react";
import { type RouterOutput } from "~/trpc/client";
import { ImageWithFallback } from "~/components/image-with-fallback";
import { Slider } from "~/components/ui/slider";
import { useAllProductSearchParams } from "~/components/features/products/hooks";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "~/components/ui/input-group";
import { FilterChip } from "./filter-chip";

const PRICE_MAX = 99999;

export function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="mb-4 text-sm font-medium">{title}</legend>
      {children}
    </fieldset>
  );
}

export function BrandFilterItem({
  brand,
}: {
  brand: RouterOutput["public"]["brands"]["queries"]["findAll"][number];
}) {
  const [filters, setFilters] = useAllProductSearchParams();
  const pressed = Boolean(filters.brands?.includes(brand.slug));

  function handleBrandChange(slug: string) {
    void setFilters((prev) => {
      if (prev.brands?.includes(slug)) {
        const filteredBrands = prev.brands.filter((brand) => brand !== slug);
        return {
          ...prev,
          brands: filteredBrands.length > 0 ? filteredBrands : null,
        };
      }

      return { ...prev, brands: [...(prev.brands ?? []), slug] };
    });
  }

  return (
    <FilterChip
      pressed={pressed}
      onPressedChange={() => handleBrandChange(brand.slug)}
      className="pl-1.5"
    >
      <ImageWithFallback
        src={brand.logo}
        alt=""
        width={48}
        height={48}
        className="size-6 rounded-full border-none bg-white [&_img]:object-contain"
      />
      {brand.name}
    </FilterChip>
  );
}

const PRICE_STEP = 50;

/** Bounds the slider to the live products' prices, rounded out to the step, so each pixel moves a useful amount. */
function getPriceBounds(range: PriceRange | null) {
  if (!range) return { lo: 0, hi: PRICE_MAX };
  const lo = Math.floor(range.min / PRICE_STEP) * PRICE_STEP;
  const hi = Math.max(
    Math.ceil(range.max / PRICE_STEP) * PRICE_STEP,
    lo + PRICE_STEP,
  );
  return { lo, hi };
}

type PriceRange = { min: number; max: number };

export function PriceFilter({ range }: { range: PriceRange | null }) {
  const [filters, setFilters] = useAllProductSearchParams();
  const { lo, hi } = getPriceBounds(range);
  const clamp = (value: number) => Math.min(hi, Math.max(lo, value));
  const min = clamp(filters.minPrice ?? lo);
  const max = clamp(filters.maxPrice ?? hi);

  // a bound at the end of the range is no filter at all, so it leaves the URL
  function setPrice(nextMin: number, nextMax: number) {
    void setFilters((prev) => ({
      ...prev,
      minPrice: nextMin <= lo ? null : nextMin,
      maxPrice: nextMax >= hi ? null : nextMax,
    }));
  }

  return (
    <div className="flex flex-col gap-5">
      <Slider
        min={lo}
        max={hi}
        step={PRICE_STEP}
        minStepsBetweenValues={1}
        value={[min, max]}
        aria-label="Price range"
        onValueChange={(value) => {
          const [nextMin = lo, nextMax = hi] =
            typeof value === "number" ? [value] : value;
          setPrice(nextMin, nextMax);
        }}
      />

      <div className="flex items-center gap-3">
        <PriceInput
          label="Minimum price"
          value={min}
          onCommit={(value) => {
            const next = clamp(value);
            setPrice(Math.min(next, max), max);
          }}
        />
        <span aria-hidden className="text-muted-foreground">
          –
        </span>
        <PriceInput
          label="Maximum price"
          value={max}
          onCommit={(value) => {
            const next = clamp(value);
            setPrice(min, Math.max(next, min));
          }}
        />
      </div>
    </div>
  );
}

/** A typed price that applies on Enter or when the field loses focus, not on every keystroke. */
function PriceInput({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  // follow the slider and the URL when they move the value
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(String(value));
  }

  function commit() {
    const parsed = Number.parseInt(draft.replace(/\D/g, ""), 10);
    if (Number.isNaN(parsed)) {
      setDraft(String(value));
      return;
    }
    onCommit(parsed);
    // a clamped or unchanged value doesn't come back through props, so the field shows what was applied
    setDraft(String(value));
  }

  return (
    <InputGroup className="pointer-coarse:h-11">
      <InputGroupAddon>EGP</InputGroupAddon>
      <InputGroupInput
        aria-label={label}
        inputMode="numeric"
        enterKeyHint="done"
        autoComplete="off"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          }
        }}
        className="tabular-nums"
      />
    </InputGroup>
  );
}

export function NoBrandsFound() {
  return (
    <p className="text-muted-foreground text-sm">No brands to filter by yet.</p>
  );
}
