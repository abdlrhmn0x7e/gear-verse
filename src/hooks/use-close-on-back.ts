import { useCallback, useEffect, useEffectEvent, useRef } from "react";

/**
 * Lets the browser's back gesture close an open drawer instead of leaving the page, the way a native sheet does.
 * Opening pushes a history entry for the same URL; back pops it and closes, and closing any other way pops it too.
 * Links inside the drawer are detected; call the returned function before navigating from code (router.push), so the
 * entry is left for the new page to land on rather than popped from under it.
 */
export function useCloseOnBack(open: boolean, onClose: () => void) {
  const close = useEffectEvent(onClose);
  const navigating = useRef(false);

  useEffect(() => {
    if (!open) return;
    navigating.current = false;

    // Copying the state keeps Next's router tree on the entry
    history.pushState(history.state, "", location.href);

    // Filters write the URL in place (replaceState) while the drawer is open, so the entry under it keeps the old
    // query and back would undo them; the latest URL is carried down when the drawer's entry is popped
    let latestHref = location.href;
    // kept unbound so the cleanup can put back exactly what Next and nuqs installed
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const replaceState = history.replaceState;
    const trackingReplaceState: History["replaceState"] = function (
      this: History,
      ...args
    ) {
      replaceState.apply(this, args);
      // Next's own writes carry its state; they follow the router, and on a pop Chromium runs Next's listener first
      if (!(args[0] as { __NA?: boolean } | null)?.__NA) {
        latestHref = location.href;
      }
    };
    history.replaceState = trackingReplaceState;

    // The popped entry is the same page, so the router has nothing to restore; where this capture listener runs first
    // (WebKit) Next's is kept out. Either way the latest URL then goes through replaceState without Next's state, as
    // nuqs writes it, so the router and the filters take it over the entry's old query
    function absorbPop(event: PopStateEvent) {
      event.stopImmediatePropagation();
      if (location.href !== latestHref) {
        history.replaceState(null, "", latestHref);
      }
    }

    let poppedByBack = false;
    function onPopState(event: PopStateEvent) {
      poppedByBack = true;
      absorbPop(event);
      close();
    }

    // a link inside the drawer navigates on top of the drawer's entry; popping it then would undo the navigation
    let followedLink = false;
    function onClick(event: MouseEvent) {
      if (
        event.target instanceof Element &&
        event.target.closest("a[href]") &&
        !event.defaultPrevented
      ) {
        followedLink = true;
      }
    }

    window.addEventListener("popstate", onPopState, { capture: true });
    document.addEventListener("click", onClick, true);

    return () => {
      window.removeEventListener("popstate", onPopState, { capture: true });
      document.removeEventListener("click", onClick, true);
      if (history.replaceState === trackingReplaceState) {
        history.replaceState = replaceState;
      }
      if (poppedByBack || followedLink || navigating.current) return;

      window.addEventListener("popstate", absorbPop, {
        capture: true,
        once: true,
      });
      history.back();
    };
  }, [open]);

  return useCallback(() => {
    navigating.current = true;
  }, []);
}
