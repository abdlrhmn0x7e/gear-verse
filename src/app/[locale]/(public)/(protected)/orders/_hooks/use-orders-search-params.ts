import { useQueryStates } from "nuqs";
import { createLoader, parseAsInteger } from "nuqs/server";

const ordersSearchParams = {
  orderId: parseAsInteger,
};

export function useOrdersSearchParams() {
  return useQueryStates(ordersSearchParams, { shallow: true });
}

export const loadOrderSearchParams = createLoader(ordersSearchParams);

// set when this page pushed the open order onto the history, so closing can pop it
let pushedOrder = false;

/**
 * The order drawer's open state in `?orderId`. Opening pushes a history entry,
 * so the phone's back button or swipe closes the drawer instead of leaving the
 * page; closing pops that entry again rather than stacking another one. An
 * order opened straight from a link (the success page's "Track your order")
 * has no entry of ours to pop, so closing just clears the param.
 */
export function useOrderDrawer() {
  const [{ orderId }, setParams] = useOrdersSearchParams();

  return {
    orderId,
    open(id: number) {
      pushedOrder = true;
      void setParams({ orderId: id }, { history: "push" });
    },
    close() {
      if (pushedOrder) {
        pushedOrder = false;
        window.history.back();
        return;
      }
      void setParams({ orderId: null });
    },
  };
}
