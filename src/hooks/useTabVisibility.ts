"use client";

import { useEffect, useState } from "react";

/**
 * Tracks whether the current tab is visible via the Page Visibility API.
 * Pairs with a CSS `[data-ambient-active="false"]` rule (see
 * `ServicesCarousel.tsx` and the call-center page's section styles) to pause
 * always-on decorative animations while the tab is hidden.
 */
export function useTabVisibility() {
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const syncVisibility = () => setTabVisible(!document.hidden);
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  return tabVisible;
}
