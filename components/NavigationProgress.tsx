"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/** Don't show the bar at all if the route lands faster than this — avoids a flash. */
const SHOW_DELAY = 100;
/** Never leave the bar stuck if a navigation dies silently. */
const SAFETY_TIMEOUT = 12_000;

type Phase = "idle" | "loading" | "done";

const START_EVENT = "navigationprogress:start";

/**
 * Kick the bar for navigations that aren't an anchor click or back/forward —
 * i.e. programmatic `router.push()`.
 */
export function startNavigationProgress() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(START_EVENT));
}

/**
 * Slim top progress bar for client-side route transitions.
 *
 * There is deliberately no root `loading.tsx` (a Suspense boundary above every
 * route makes Next stream a 200 before the page runs, breaking `notFound()` and
 * `redirect()` status codes). This restores the "something is happening" signal
 * without reintroducing that.
 *
 * Completion is driven by `usePathname()` changing, i.e. the new route committed.
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);

  const running = useRef(false);
  const shown = useRef(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trickle = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (showTimer.current) clearTimeout(showTimer.current);
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
    if (trickle.current) clearInterval(trickle.current);
    showTimer.current = null;
    safetyTimer.current = null;
    trickle.current = null;
  }, []);

  const finish = useCallback(() => {
    if (!running.current) return;
    running.current = false;
    clearTimers();

    if (!shown.current) {
      // Navigation beat the delay — nothing was ever painted.
      setPhase("idle");
      setProgress(0);
      return;
    }

    shown.current = false;
    setProgress(100);
    setPhase("done");
    doneTimer.current = setTimeout(() => {
      setPhase("idle");
      setProgress(0);
    }, 320);
  }, [clearTimers]);

  const start = useCallback(() => {
    if (running.current) return;
    running.current = true;
    if (doneTimer.current) clearTimeout(doneTimer.current);

    showTimer.current = setTimeout(() => {
      shown.current = true;
      setPhase("loading");
      setProgress(12);
      // Ease toward 92% so the bar always has somewhere to go.
      trickle.current = setInterval(() => setProgress((p) => p + (92 - p) * 0.12), 220);
    }, SHOW_DELAY);

    safetyTimer.current = setTimeout(finish, SAFETY_TIMEOUT);
  }, [finish]);

  // The new route committed.
  useEffect(() => {
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as Element | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      // Same route (or a pure hash change) — nothing will load.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      start();
    };

    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener("popstate", start);
    window.addEventListener(START_EVENT, start);
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("popstate", start);
      window.removeEventListener(START_EVENT, start);
    };
  }, [start]);

  useEffect(
    () => () => {
      clearTimers();
      if (doneTimer.current) clearTimeout(doneTimer.current);
    },
    [clearTimers],
  );

  return (
    <div className="nav-progress" data-state={phase} aria-hidden>
      <div className="nav-progress__bar" style={{ width: `${progress}%` }} />
    </div>
  );
}
