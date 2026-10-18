import { useEffect, useEffectEvent } from "react";

/**
 * Lets the browser's back gesture close an open drawer instead of leaving the page, the way a native sheet does.
 * Opening pushes a history entry for the same URL; back pops it and closes, and closing any other way pops it too.
 */
export function useCloseOnBack(open: boolean, onClose: () => void) {
  const close = useEffectEvent(onClose);

  useEffect(() => {
    if (!open) return;

    // Copying the state keeps Next's router tree on the entry, so returning to it is a no-op for the router
    history.pushState(history.state, "", location.href);

    // Filters write the URL in place (replaceState) while the drawer is open, so the entry under it still has the old
    // query; it is carried down when the drawer's entry is popped, or back would undo the filters
    let latestHref = location.href;
    // kept unbound so the cleanup can put back exactly what Next and nuqs installed
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const replaceState = history.replaceState;
    const trackingReplaceState: History["replaceState"] = function (
      this: History,
      ...args
    ) {
      replaceState.apply(this, args);
      latestHref = location.href;
    };
    history.replaceState = trackingReplaceState;

    function carryUrlDown() {
      if (location.href !== latestHref) {
        history.replaceState(history.state, "", latestHref);
      }
    }

    let poppedByBack = false;
    function onPopState() {
      poppedByBack = true;
      carryUrlDown();
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

    window.addEventListener("popstate", onPopState);
    document.addEventListener("click", onClick, true);

    return () => {
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onClick, true);
      if (history.replaceState === trackingReplaceState) {
        history.replaceState = replaceState;
      }
      if (poppedByBack || followedLink) return;

      window.addEventListener("popstate", carryUrlDown, { once: true });
      history.back();
    };
  }, [open]);
}
