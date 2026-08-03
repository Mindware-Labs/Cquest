import type { ServiceIconName } from "@/components/services/data";
import type { Locale } from "@/i18n/config";

/* ── MOCKUP DATA — NOT REAL ───────────────────────────────────────────────
   Center Quest has not defined its departments yet: neither which ones nor
   how many. This file exists so the org chart can be designed, reviewed and
   agreed on BEFORE that conversation happens, not to stand in for it.

   Everything here is therefore deliberately, visibly fake:

     • Departments are lettered A–F, not named. A plausible invented name
       ("Operations", "Quality") is the dangerous option — it survives review
       because nobody questions it, and ships. A letter cannot.
     • People are "Person 01", their roles are "Role 01", and every bio is
       lorem ipsum. Same reasoning.
     • Headcounts are uneven on purpose. Six departments of exactly four
       people reads as a diagram; 6/4/5/3/4/3 reads as an organisation, which
       is what the layout has to survive.

   When the real structure arrives, this table is the only file that changes —
   OrgChart renders whatever it is handed. See MEMORY: seccion-equipo. */

export type TeamMember = {
  id: string;
  name: Record<Locale, string>;
  role: Record<Locale, string>;
  bio: Record<Locale, string>;
};

export type Department = {
  id: string;
  letter: string;
  icon: ServiceIconName;
  label: Record<Locale, string>;
  /* The one line that would describe what the department does. Lorem for now;
     this is the field the client's own words drop into. */
  summary: Record<Locale, string>;
  members: readonly TeamMember[];
};

/* Four lorem bodies, cycled across the roster. One repeated string would make
   every card identical and hide the ragged-bottom problem a real grid of
   uneven bios will have; four lengths surface it while the design can still
   be changed. */
const LOREM: readonly Record<Locale, string>[] = [
  {
    en: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
    es: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
  },
  {
    en: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
    es: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
  },
  {
    en: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.",
    es: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.",
  },
  {
    en: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    es: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
];

/* Built rather than hand-listed. Twenty-five literal placeholder entries is
   twenty-five chances for one to be quietly edited into something that looks
   real, and it would bury the one thing a reviewer needs to see at a glance:
   that none of this is. */
function roster(departmentId: string, count: number): readonly TeamMember[] {
  return Array.from({ length: count }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return {
      id: `${departmentId}-${n}`,
      name: { en: `Person ${n}`, es: `Persona ${n}` },
      role: { en: `Role ${n}`, es: `Cargo ${n}` },
      bio: LOREM[i % LOREM.length]!,
    };
  });
}

const PLACEHOLDER_SUMMARY: Record<Locale, string> = {
  en: "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor.",
  es: "Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor.",
};

export const DEPARTMENTS: readonly Department[] = [
  { id: "a", letter: "A", icon: "headset", size: 6 },
  { id: "b", letter: "B", icon: "workflow", size: 4 },
  { id: "c", letter: "C", icon: "code", size: 5 },
  { id: "d", letter: "D", icon: "chart", size: 3 },
  { id: "e", letter: "E", icon: "shield", size: 4 },
  { id: "f", letter: "F", icon: "userplus", size: 3 },
].map(({ id, letter, icon, size }) => ({
  id,
  letter,
  icon: icon as ServiceIconName,
  label: { en: `Department ${letter}`, es: `Departamento ${letter}` },
  summary: PLACEHOLDER_SUMMARY,
  members: roster(id, size),
}));

export const TEAM_HEADCOUNT = DEPARTMENTS.reduce((total, d) => total + d.members.length, 0);
