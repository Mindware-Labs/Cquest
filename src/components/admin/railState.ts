"use client";

export const RAIL_KEY = "cq.admin.rail";

export type RailState = "expanded" | "collapsed";

/* El script en línea del layout ya dejó el atributo puesto antes del primer
   pintado, así que el DOM es la fuente de verdad y no hay parpadeo. */
const listeners = new Set<() => void>();

export function railSnapshot(): RailState {
  return document.documentElement.dataset.rail === "collapsed" ? "collapsed" : "expanded";
}

export function railServerSnapshot(): RailState {
  return "expanded";
}

export function subscribeRail(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function toggleRail() {
  const next: RailState = railSnapshot() === "collapsed" ? "expanded" : "collapsed";
  document.documentElement.dataset.rail = next;
  try {
    localStorage.setItem(RAIL_KEY, next);
  } catch {}
  for (const notify of listeners) notify();
}

// Se ejecuta antes de que el rail pinte: sin esto, colapsado parpadearía abierto.
export const RAIL_BOOT_SCRIPT = `try{if(localStorage.getItem("${RAIL_KEY}")==="collapsed")document.documentElement.dataset.rail="collapsed"}catch(e){}`;
