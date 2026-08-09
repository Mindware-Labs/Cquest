"use client";

import { useEffect, useLayoutEffect } from "react";

export const REVEAL_DURATION = 0.9;

export const DETAIL_DURATION = 0.55;

export const SCRUB = 0.8;

export const REVEAL_START = "top 82%";

export const REVEAL_FROM = { y: 28, autoAlpha: 0, filter: "blur(10px)" } as const;
export const REVEAL_TO = { y: 0, autoAlpha: 1, filter: "blur(0px)" } as const;

export const CURTAIN = {
  fromBottom: "inset(0% 0% 100% 0%)",
  fromTop: "inset(100% 0% 0% 0%)",
  fromLeft: "inset(0% 100% 0% 0%)",
  open: "inset(0% 0% 0% 0%)",
} as const;

export const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
