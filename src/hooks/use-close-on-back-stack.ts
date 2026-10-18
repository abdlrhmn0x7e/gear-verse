import { useEffect, useEffectEvent, useRef } from "react";

/**
 * useCloseOnBack for a drawer with a nested drawer on top: one history entry per open level, and back closes only the
 * top one, the way iOS's back swipe leaves a pushed screen. Two useCloseOnBack calls can't do this: both listen on
 * window, the first registered (the root's) runs first and swallows the event, so back closed the root and left the
 * nested drawer's entry behind.
 * `depth` is how many levels are open (0 for none); `onBack` gets the depth after a back. Closing any other way pops
 * the closed levels' entries; a link followed from inside leaves them for the new page to land on.
 */
export function useCloseOnBackStack(
  depth: number,
  onBack: (depth: number) => void,
) {
  const back = useEffectEvent(onBack);
  // the entries this hook has pushed and not yet seen popped
  const pushed = useRef(0);
  const ignoreNextPop = useRef(false);
  const followedLink = useRef(false);

  useEffect(() => {
    if (depth > pushed.current) {
      if (pushed.current === 0) followedLink.current = false;
      while (pushed.current < depth) {
        // copying the state keeps Next's router tree on the entry
        history.pushState(history.state, "", location.href);
        pushed.current += 1;
      }
      return;
    }

    if (depth < pushed.current) {
      const closed = pushed.current - depth;
      pushed.current = depth;
      if (followedLink.current) return;
      ignoreNextPop.current = true;
      history.go(-closed);
    }
  }, [depth]);

  useEffect(() => {
    // the popped entries are the same page, so the router has nothing to restore; this capture listener keeps
    // Next's own out where it runs first (WebKit), and elsewhere Next restores the tree the entry already shows
    function onPopState(event: PopStateEvent) {
      if (ignoreNextPop.current) {
        ignoreNextPop.current = false;
        event.stopImmediatePropagation();
        return;
      }
      if (pushed.current === 0) return;
      event.stopImmediatePropagation();
      pushed.current -= 1;
      back(pushed.current);
    }

    function onClick(event: MouseEvent) {
      if (
        pushed.current > 0 &&
        event.target instanceof Element &&
        event.target.closest("a[href]") &&
        !event.defaultPrevented
      ) {
        followedLink.current = true;
      }
    }

    window.addEventListener("popstate", onPopState, { capture: true });
    document.addEventListener("click", onClick, true);

    return () => {
      window.removeEventListener("popstate", onPopState, { capture: true });
      document.removeEventListener("click", onClick, true);
      // unmounted while open: its entries go with it
      if (pushed.current > 0 && !followedLink.current) {
        history.go(-pushed.current);
      }
      pushed.current = 0;
    };
  }, []);
}
