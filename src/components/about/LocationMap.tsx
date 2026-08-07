"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useI18n } from "@/i18n/I18nProvider";
import {
  HQ,
  LOCATION_COPY,
  MAP_INTRO,
  MAP_STYLE_DARK,
  MAP_STYLE_LIGHT,
  MAP_URL,
} from "./locationData";
import styles from "./LocationSection.module.css";

const ES_LOCALE = {
  "AttributionControl.ToggleAttribution": "Mostrar atribución",
  "AttributionControl.MapFeedback": "Comentarios sobre el mapa",
} as const;

const easeInSine = (t: number) => 1 - Math.cos((t * Math.PI) / 2);

export default function LocationMap() {
  const { lang } = useI18n();
  const t = LOCATION_COPY[lang];
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!token || !host) return;

    let map: MapboxMap | null = null;
    let cancelled = false;
    let turnTimer: ReturnType<typeof setTimeout> | null = null;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animate = !motionQuery.matches;

    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const styleFor = (isDark: boolean) => (isDark ? MAP_STYLE_DARK : MAP_STYLE_LIGHT);

    const applyLanguage = () => {
      try {
        map?.setLanguage(lang);
      } catch (error) {
        void error;
      }
    };

    const onSchemeChange = (event: MediaQueryListEvent) => {
      map?.setStyle(styleFor(event.matches));
    };

    let loaded = false;
    let seen = false;
    let introDone = !animate;

    const abortIntro = () => {
      if (introDone) return;
      introDone = true;
      if (turnTimer) clearTimeout(turnTimer);
      map?.stop();
    };

    const runIntro = () => {
      if (introDone || !loaded || !seen || !map) return;
      introDone = true;

      turnTimer = setTimeout(() => {
        if (cancelled || !map) return;
        map.easeTo({
          center: [HQ.lng + MAP_INTRO.handoffLngOffset, HQ.lat],
          zoom: MAP_INTRO.spinZoom,
          duration: MAP_INTRO.spinDuration,
          easing: easeInSine,
          essential: true,
        });
        map.once("moveend", () => {
          if (cancelled || !map) return;
          map.flyTo({
            center: [HQ.lng, HQ.lat],
            zoom: HQ.zoom,
            bearing: 0,
            pitch: 0,
            duration: MAP_INTRO.flyDuration,
            minZoom: MAP_INTRO.flyMinZoom,
            essential: true,
          });
        });
      }, MAP_INTRO.holdBeforeSpin);
    };

    const boot = async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        if (cancelled) return;

        map = new mapboxgl.Map({
          container: host,
          accessToken: token,
          style: styleFor(darkQuery.matches),
          center: animate
            ? [HQ.lng + MAP_INTRO.startLngOffset, HQ.lat]
            : [HQ.lng, HQ.lat],
          zoom: animate ? MAP_INTRO.spinZoom : HQ.zoom,
          bearing: 0,
          dragRotate: false,
          pitchWithRotate: false,
          touchZoomRotate: true,
          attributionControl: true,
          locale: lang === "es" ? ES_LOCALE : undefined,
        });
        map.touchZoomRotate?.disableRotation();
        darkQuery.addEventListener("change", onSchemeChange);

        let styled = false;
        map.once("style.load", () => {
          styled = true;
        });
        map.on("error", () => {
          if (!styled) setFailed(true);
        });
        map.on("style.load", applyLanguage);

        const marker = new mapboxgl.Marker({
          anchor: "bottom",
          rotationAlignment: "map",
          pitchAlignment: "map",
          occludedOpacity: 0,
        })
          .setLngLat([HQ.lng, HQ.lat])
          .addTo(map);

        const pin = marker.getElement();
        pin.style.transition = "opacity 320ms var(--ease-out, ease-out)";
        const syncPin = () => {
          const visible = (map?.getZoom() ?? 0) >= MAP_INTRO.pinRevealZoom;
          pin.style.opacity = visible ? "1" : "0";
          pin.style.pointerEvents = visible ? "" : "none";
        };
        syncPin();
        map.on("zoom", syncPin);

        for (const event of ["mousedown", "wheel", "touchstart", "dragstart"] as const) {
          map.on(event, abortIntro);
        }

        map.on("load", () => {
          if (cancelled) return;
          setReady(true);
          loaded = true;
          runIntro();
        });
      } catch (error) {
        void error;
        if (!cancelled) setFailed(true);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        void boot();
      },
      { rootMargin: "400px" },
    );
    observer.observe(host);

    const introObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        introObserver.disconnect();
        seen = true;
        runIntro();
      },
      { threshold: 0.35 },
    );
    introObserver.observe(host);

    return () => {
      cancelled = true;
      if (turnTimer) clearTimeout(turnTimer);
      observer.disconnect();
      introObserver.disconnect();
      darkQuery.removeEventListener("change", onSchemeChange);
      map?.remove();
    };
  }, [token, lang]);

  if (!token || failed) {
    return (
      <div className={styles.mapFallback}>
        <p className={styles.fallbackTitle}>{t.fallbackTitle}</p>
        <p className={styles.fallbackBody}>{t.fallbackBody}</p>
        <a className={styles.fallbackAction} href={MAP_URL} target="_blank" rel="noreferrer">
          {t.fallbackAction}
        </a>
      </div>
    );
  }

  return (
    <>
      <div
        ref={hostRef}
        className={styles.mapHost}
        data-ready={ready || undefined}
        role="region"
        aria-label={t.mapAriaLabel}
      />
      <span aria-hidden className={styles.mapVeil} />
    </>
  );
}
