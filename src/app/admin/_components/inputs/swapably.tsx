"use client";

import * as React from "react";
import { createSwapy, utils, type Swapy, type SwapEvent } from "swapy";

export function Swapably<T>({
  items,
  onSwap,
  Comp,
  containerClassName,
  slotClassName,
  itemClassName,
  children,
  getId,
}: {
  items: T[];
  onSwap: (event: SwapEvent) => void;
  Comp: (props: { item: T; index?: number }) => React.ReactNode;
  containerClassName?: string;
  slotClassName?: string | ((index: number) => string | undefined);
  itemClassName?: (index: number) => string | undefined;
  children?: React.ReactNode;
  getId?: (item: T) => string | number;
}) {
  // Swapy expects string ids in its SlotItemMap. Our domain id (mediaId) is a number,
  // so we derive a stable string id only for Swapy usage to avoid string/number mismatches.
  const swapyItems = React.useMemo(
    () =>
      items.map((item, index) => ({
        ...item,
        swapyId: String(getId ? getId(item) : index),
      })),
    [items, getId],
  );

  const [slotItemMap, setSlotItemMap] = React.useState(
    utils.initSlotItemMap(swapyItems, "swapyId"),
  );
  const slottedItems = React.useMemo(
    () => utils.toSlottedItems(swapyItems, "swapyId", slotItemMap),
    [swapyItems, slotItemMap],
  );

  const swapy = React.useRef<Swapy | null>(null);
  const container = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!swapy.current) return;
    return utils.dynamicSwapy(
      swapy.current,
      swapyItems,
      "swapyId",
      slotItemMap,
      setSlotItemMap,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapyItems]);

  React.useEffect(() => {
    // If container element is loaded
    if (container.current) {
      swapy.current = createSwapy(container.current, {
        manualSwap: true,
      });

      swapy.current.onSwap((event) => {
        onSwap(event);
        setSlotItemMap(event.newSlotItemMap.asArray);
      });
    }

    return () => {
      // Destroy the swapy instance on component destroy
      swapy.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={container} className={containerClassName}>
      {slottedItems.map(({ slotId, itemId, item }, index) => (
        <div
          key={slotId}
          data-swapy-slot={slotId}
          className={
            typeof slotClassName === "function"
              ? slotClassName(index)
              : slotClassName
          }
        >
          {itemId && item ? (
            <div
              key={`swapy-item-${itemId}`}
              data-swapy-item={itemId}
              className={itemClassName?.(index)}
            >
              <Comp item={item} index={index} />
            </div>
          ) : null}
        </div>
      ))}
      {children}
    </div>
  );
}
