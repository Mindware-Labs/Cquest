"use client";

import { useEffect, useState } from "react";

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
