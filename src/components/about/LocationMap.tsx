"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useI18n } from "@/i18n/I18nProvider";
import { HQ, LOCATION_COPY, MAP_STYLE_DARK, MAP_STYLE_LIGHT, MAP_URL } from "./locationData";
import styles from "./LocationSection.module.css";

const ES_LOCALE = {
  "AttributionControl.ToggleAttribution": "Mostrar atribución",
  "AttributionControl.MapFeedback": "Comentarios sobre el mapa",
} as const;

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

    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const styleFor = (isDark: boolean) => (isDark ? MAP_STYLE_DARK : MAP_STYLE_LIGHT);

    const onSchemeChange = (event: MediaQueryListEvent) => {
      map?.setStyle(styleFor(event.matches));
    };

    const boot = async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        if (cancelled) return;

        map = new mapboxgl.Map({
          container: host,
          accessToken: token,
          style: styleFor(darkQuery.matches),
          center: [HQ.lng, HQ.lat],
          zoom: HQ.zoom,
          dragRotate: false,
          pitchWithRotate: false,
          touchZoomRotate: true,
          attributionControl: true,
          locale: lang === "es" ? ES_LOCALE : undefined,
        });
        map.touchZoomRotate?.disableRotation();
        darkQuery.addEventListener("change", onSchemeChange);

        new mapboxgl.Marker({ anchor: "bottom" }).setLngLat([HQ.lng, HQ.lat]).addTo(map);

        let painted = false;
        map.on("error", () => {
          if (!painted) setFailed(true);
        });
        map.on("load", () => {
          if (cancelled) return;
          painted = true;
          try {
            map?.setLanguage(lang);
          } catch (error) {
            void error;
          }
          setReady(true);
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

    return () => {
      cancelled = true;
      observer.disconnect();
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
