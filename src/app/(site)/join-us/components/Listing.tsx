"use client";

import { useMemo, useState, type ReactNode } from "react";
import container from "@/components/services/Container.module.css";
import { TransitionLink } from "@/components/TransitionLink";
import ServiceIcon from "@/components/services/ServiceIcon";
import type { ServiceIconName } from "@/components/services/data";
import type { PublicVacancy } from "@/lib/vacancies";
import type { Hiring } from "../JoinUsExperience";
import Intro from "./Intro";
import VacancyTable from "./VacancyTable";
import { OPEN_APPLICATION_HREF, PinIcon, type LocationOption } from "./shared";
import styles from "./Listing.module.css";

function Chip({
  label,
  count,
  icon,
  pressed,
  onClick,
}: {
  label: string;
  count: number;
  icon?: ReactNode;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={styles.chip} aria-pressed={pressed} onClick={onClick}>
      {icon}
      {label}
      <span className={styles.chipCount}>{count}</span>
    </button>
  );
}

export default function Listing({
  reduced,
  openings,
  hiring,
}: {
  reduced: boolean;
  openings: PublicVacancy[];
  hiring: Hiring[];
}) {
  const [departments, setDepartments] = useState<Set<string>>(new Set());
  const [locations, setLocations] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");

  const count = openings.length;

  // Las regiones no vienen catalogadas como los departamentos: se derivan de
  // lo que hay publicado ahora mismo, igual que "hiring" pero para location.
  const locationOptions = useMemo<LocationOption[]>(() => {
    const counts = new Map<string, number>();
    for (const entry of openings) {
      if (!entry.location) continue;
      counts.set(entry.location, (counts.get(entry.location) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([location, total]) => ({ location, count: total }))
      .sort((a, b) => b.count - a.count || a.location.localeCompare(b.location));
  }, [openings]);

  const updatedAt = useMemo(
    () => openings.reduce<string | null>((latest, entry) => (!latest || entry.publishedAt > latest ? entry.publishedAt : latest), null),
    [openings],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return openings.filter((entry) => {
      if (departments.size > 0 && (!entry.departmentSlug || !departments.has(entry.departmentSlug))) return false;
      if (locations.size > 0 && (!entry.location || !locations.has(entry.location))) return false;
      if (q) {
        const haystack = `${entry.title} ${entry.summary} ${entry.departmentLabel ?? ""} ${entry.location ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [openings, departments, locations, query]);

  const filtered = departments.size > 0 || locations.size > 0 || query.trim().length > 0;

  function toggle(setter: typeof setDepartments, value: string) {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  function clearFilters() {
    setDepartments(new Set());
    setLocations(new Set());
    setQuery("");
  }

  // Desde el panel se aterriza en un solo departamento, no se acumula.
  function pickDepartment(slug: string) {
    setDepartments(new Set([slug]));
    setLocations(new Set());
    setQuery("");
  }

  const hasFilters = hiring.length > 1 || locationOptions.length > 1;

  return (
    <section className={styles.page}>
      <div className={container.container}>
        <Intro
          reduced={reduced}
          count={count}
          hiring={hiring}
          locations={locationOptions}
          updatedAt={updatedAt}
          query={query}
          onQueryChange={setQuery}
          onPickDepartment={pickDepartment}
        />

        <div id="openings" className={styles.board}>
          <div className={styles.toolbar}>
            {hasFilters && (
              <div className={styles.filters}>
                {hiring.length > 1 && (
                  <div className={styles.filterGroup} role="group" aria-label="Filter by department">
                    <span className={styles.filterLabel}>Department</span>
                    <Chip label="All" count={count} pressed={departments.size === 0} onClick={() => setDepartments(new Set())} />
                    {hiring.map((entry) => (
                      <Chip
                        key={entry.slug}
                        label={entry.shortLabel}
                        count={entry.count}
                        icon={
                          <span className={styles.chipIcon} aria-hidden="true">
                            <ServiceIcon name={entry.icon as ServiceIconName} />
                          </span>
                        }
                        pressed={departments.has(entry.slug)}
                        onClick={() => toggle(setDepartments, entry.slug)}
                      />
                    ))}
                  </div>
                )}

                {locationOptions.length > 1 && (
                  <div className={styles.filterGroup} role="group" aria-label="Filter by location">
                    <span className={styles.filterLabel}>Location</span>
                    {locationOptions.map((entry) => (
                      <Chip
                        key={entry.location}
                        label={entry.location}
                        count={entry.count}
                        icon={
                          <span className={styles.chipIcon} aria-hidden="true">
                            <PinIcon />
                          </span>
                        }
                        pressed={locations.has(entry.location)}
                        onClick={() => toggle(setLocations, entry.location)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className={styles.results}>
              {filtered && (
                <button type="button" className={styles.resultsReset} onClick={clearFilters}>
                  Clear filters
                </button>
              )}
              <span className={styles.resultsCount} aria-live="polite">
                {filtered ? `Showing ${visible.length} of ${count}` : `${count} open position${count === 1 ? "" : "s"}`}
              </span>
            </div>
          </div>

          {visible.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyMark} aria-hidden="true">
                <ServiceIcon name="userplus" />
              </span>
              <h2 className={styles.emptyTitle}>{count === 0 ? "Nothing open right now" : "No matches for that search"}</h2>
              <p className={styles.emptyText}>
                {count === 0
                  ? "We are not actively hiring at this exact moment, but our team keeps growing. Send us your resume and we will reach out when a fit opens up."
                  : "Try a different keyword, or clear the filters to see every open position."}
              </p>
              {count === 0 ? (
                <TransitionLink className={styles.emptyCta} href={OPEN_APPLICATION_HREF}>
                  Send your resume
                </TransitionLink>
              ) : (
                <button type="button" className={styles.emptyCta} onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <VacancyTable reduced={reduced} vacancies={visible} />
          )}
        </div>
      </div>
    </section>
  );
}
