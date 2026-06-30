import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router does not restore/reset scroll on navigation, so a new route
// inherits the previous scroll position (e.g. opening a session detail while
// scrolled down the sessions grid would land mid/bottom of the page).
// Reset to top on path change; honor in-page hash anchors like /#sessions.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  // Disable the browser's native scroll restoration. Otherwise, on a direct
  // load/reload, it re-applies a saved scroll position after async content
  // grows the page, landing the user mid/bottom of the detail page.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
